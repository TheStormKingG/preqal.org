#!/usr/bin/env node
'use strict';

/**
 * pull-web-edits.cjs v2 — HTML-to-OOXML body replacement
 *
 * Converts content_html saved by the QMS browser editor into proper OOXML and
 * replaces the <w:body> of the matching local DOCX file — preserving the
 * original document's header, footer, styles, and page layout (w:sectPr).
 *
 * Unlike the previous word-diff approach, this handles ALL edit types:
 * paragraph additions, deletions, formatting changes, list edits, table edits.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<key> node scripts/pull-web-edits.cjs [--apply] [--clear]
 *
 * Flags:
 *   (none)   Dry run — reports docs with pending edits, writes nothing
 *   --apply  Replace body content in local DOCX files
 *   --clear  After --apply, clear content_html in DB (marks doc as in-sync)
 */

const JSZip = require('jszip');
const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const IMS_DIR      = path.resolve(__dirname, '../public/ims');
const QMS_DIR      = path.resolve(__dirname, '../../../../Preqal QMS');
const APPLY        = process.argv.includes('--apply');
const CLEAR        = process.argv.includes('--clear');

// Maps doc_id prefix → subfolder inside QMS_DIR
const QMS_SUBDIR = {
  POL: '01 - Policies',
  PRO: '02 - Procedures',
  MAN: '03 - Manuals',
  WOI: '04 - Work Instructions',
  FOR: '05 - Forms',
};

if (CLEAR && !APPLY) {
  console.error('\nERROR: --clear requires --apply.\n');
  process.exit(1);
}

// ─── XML escaping ─────────────────────────────────────────────────────────────
function escXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── HTML tokenizer ───────────────────────────────────────────────────────────
// Produces a flat list of {type, tag, attrs, content} tokens from HTML string.
function tokenizeHtml(html) {
  const tokens  = [];
  const tagRe   = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*)?)(\/?)\s*>/g;
  // Self-closing void elements
  const VOID    = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  let lastIdx   = 0;
  let m;

  const decodeEntities = s => s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

  while ((m = tagRe.exec(html)) !== null) {
    if (m.index > lastIdx) {
      const text = decodeEntities(html.slice(lastIdx, m.index));
      if (text) tokens.push({ type: 'text', content: text });
    }
    const isClose     = m[1] === '/';
    const tag         = m[2].toLowerCase();
    const isSelfClose = m[4] === '/' || VOID.has(tag);

    const attrs = {};
    const attrRe = /([a-zA-Z][a-zA-Z0-9\-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
    let am;
    while ((am = attrRe.exec(m[3])) !== null) {
      if (am[1]) attrs[am[1].toLowerCase()] = am[2] ?? am[3] ?? am[4] ?? true;
    }

    if (isClose)         tokens.push({ type: 'close', tag });
    else if (isSelfClose) tokens.push({ type: 'self',  tag, attrs });
    else                 tokens.push({ type: 'open',  tag, attrs });

    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < html.length) {
    const text = decodeEntities(html.slice(lastIdx));
    if (text.trim()) tokens.push({ type: 'text', content: text });
  }

  return tokens;
}

// ─── Build node tree ──────────────────────────────────────────────────────────
function buildTree(tokens) {
  const root  = { tag: 'root', attrs: {}, children: [] };
  const stack = [root];

  for (const tok of tokens) {
    const parent = stack[stack.length - 1];
    if (tok.type === 'text') {
      parent.children.push({ type: 'text', content: tok.content });
    } else if (tok.type === 'self') {
      parent.children.push({ type: 'element', tag: tok.tag, attrs: tok.attrs, children: [] });
    } else if (tok.type === 'open') {
      const node = { type: 'element', tag: tok.tag, attrs: tok.attrs, children: [] };
      parent.children.push(node);
      stack.push(node);
    } else if (tok.type === 'close') {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tok.tag) { stack.length = i; break; }
      }
    }
  }
  return root;
}

// ─── OOXML run builder ────────────────────────────────────────────────────────
function wRPr({ bold, italic, underline, size } = {}) {
  const hp = size || 24; // default 12pt = 24 half-points; callers pass explicit size for headings
  let s = '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>';
  if (bold)      s += '<w:b/><w:bCs/>';
  if (italic)    s += '<w:i/><w:iCs/>';
  if (underline) s += '<w:u w:val="single"/>';
  s += `<w:sz w:val="${hp}"/><w:szCs w:val="${hp}"/>`;
  return `<w:rPr>${s}</w:rPr>`;
}

function wRun(text, fmt = {}) {
  if (!text) return '';
  const displayText = text.replace(/\n/g, ' ');
  return `<w:r>${wRPr(fmt)}<w:t xml:space="preserve">${escXml(displayText)}</w:t></w:r>`;
}

// ─── Inline run collector ─────────────────────────────────────────────────────
// Walks mixed inline content (text, <strong>, <em>, <a>, <br>, etc.) and
// emits OOXML runs. Inline tags accumulate formatting in ctx.
function inlineToRuns(nodes, ctx = {}) {
  let out = '';
  for (const n of nodes) {
    if (n.type === 'text') {
      const txt = n.content.replace(/\n/g, ' ');
      if (txt) out += wRun(txt, ctx);
    } else if (n.type === 'element') {
      switch (n.tag) {
        case 'strong': case 'b':
          out += inlineToRuns(n.children, { ...ctx, bold: true }); break;
        case 'em': case 'i':
          out += inlineToRuns(n.children, { ...ctx, italic: true }); break;
        case 'u':
          out += inlineToRuns(n.children, { ...ctx, underline: true }); break;
        case 'br':
          out += `<w:r><w:br/></w:r>`; break;
        case 'span': case 'a': case 'abbr': case 'cite': case 'mark': case 'sub': case 'sup':
          out += inlineToRuns(n.children, ctx); break;
        default:
          // Unknown inline — pass through
          out += inlineToRuns(n.children, ctx);
      }
    }
  }
  return out;
}

// Standard paragraph properties: 1.5 line spacing + widow control.
// keepLines prevents a paragraph from splitting across pages.
const LINE_1_5 = '<w:spacing w:line="360" w:lineRule="auto"/>';

// PRO sections that must start on a new page (page 2 = Purpose, page 3 = Overview,
// page 4+ = Procedure, last page = Communication + Related Documents)
const PRO_PAGE_BREAK_SECTIONS = new Set([
  'Purpose',
  'Overview',
  'Procedure',
  'Communication (of this procedure)',
]);

// ─── Block converter ──────────────────────────────────────────────────────────
// opts.proLayout — true for PRO documents: insert page breaks at designated sections
function blocksToOoxml(nodes, opts = {}) {
  let out = '';

  for (const n of nodes) {
    if (n.type === 'text') {
      const txt = n.content.trim();
      if (txt) out += `<w:p><w:pPr>${LINE_1_5}<w:keepLines/></w:pPr>${wRun(txt)}</w:p>`;
      continue;
    }
    if (n.type !== 'element') continue;

    switch (n.tag) {
      case 'p': case 'div': {
        const runs = inlineToRuns(n.children);
        out += `<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto" w:after="80"/><w:keepLines/></w:pPr>${runs}</w:p>`;
        break;
      }

      case 'h1':
        out += headingPara(n, 32, 240, 120); break;
      case 'h2':
        out += headingPara(n, 28, 200, 100); break;
      case 'h3':
        out += headingPara(n, 24, 180,  80); break;
      case 'h4':
        out += headingPara(n, 22, 160,  60); break;

      case 'ul': {
        for (const li of n.children.filter(c => c.tag === 'li')) {
          const runs = inlineToRuns(li.children);
          out += `<w:p>`
               + `<w:pPr><w:spacing w:line="360" w:lineRule="auto" w:after="60"/><w:keepLines/><w:ind w:left="720" w:hanging="360"/></w:pPr>`
               + `${wRun('•\t')}${runs}</w:p>`;
        }
        break;
      }

      case 'ol': {
        let i = 1;
        for (const li of n.children.filter(c => c.tag === 'li')) {
          const runs = inlineToRuns(li.children);
          out += `<w:p>`
               + `<w:pPr><w:spacing w:line="360" w:lineRule="auto" w:after="60"/><w:keepLines/><w:ind w:left="720" w:hanging="360"/></w:pPr>`
               + `${wRun(`${i++}.\t`)}${runs}</w:p>`;
        }
        break;
      }

      case 'table':
        out += tableToOoxml(n); break;

      case 'hr':
        out += `<w:p><w:pPr>${LINE_1_5}<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="CBD5E1"/></w:pBdr></w:pPr></w:p>`;
        break;

      case 'blockquote':
        out += `<w:p><w:pPr>${LINE_1_5}<w:keepLines/><w:ind w:left="720"/></w:pPr>${inlineToRuns(n.children)}</w:p>`;
        break;

      case 'article': {
        const secName = n.attrs['data-sec'] || '';
        const pageBreak = opts.proLayout && PRO_PAGE_BREAK_SECTIONS.has(secName);
        if (secName) out += sectionHeadingPara(secName, pageBreak);
        const children = n.children.filter(c =>
          !(c.tag === 'h2' && /sec-heading/.test(c.attrs?.class || ''))
        );
        out += blocksToOoxml(children, opts);
        break;
      }

      default:
        out += blocksToOoxml(n.children, opts);
    }
  }

  return out || '<w:p/>';
}

// ─── Heading paragraph ────────────────────────────────────────────────────────
function headingPara(node, halfPt, spaceBefore, spaceAfter) {
  const runs = inlineToRuns(node.children, { bold: true, size: halfPt });
  return `<w:p>`
       + `<w:pPr><w:spacing w:line="360" w:lineRule="auto" w:before="${spaceBefore}" w:after="${spaceAfter}"/><w:keepLines/></w:pPr>`
       + `${runs}</w:p>`;
}

// Section heading: bold underline 14pt. pageBreakBefore inserts a hard page break.
function sectionHeadingPara(text, pageBreakBefore = false) {
  return `<w:p>`
       + `<w:pPr><w:spacing w:line="360" w:lineRule="auto" w:before="240" w:after="80"/><w:keepLines/>`
       + (pageBreakBefore ? '<w:pageBreakBefore/>' : '')
       + `</w:pPr>`
       + `<w:r><w:rPr>`
       + `<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>`
       + `<w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/>`
       + `<w:u w:val="single"/></w:rPr>`
       + `<w:t xml:space="preserve">${escXml(text)}</w:t></w:r>`
       + `</w:p>`;
}

// ─── Table converter ──────────────────────────────────────────────────────────
function tableToOoxml(tableNode) {
  const rows = [];
  const walk = ns => {
    for (const n of ns) {
      if (n.tag === 'tr')   rows.push(n);
      else if (n.children) walk(n.children);
    }
  };
  walk(tableNode.children);

  const tblPr = `<w:tblPr>`
              + `<w:tblW w:w="0" w:type="auto"/>`
              + `<w:tblBorders>`
              + `<w:top w:val="single" w:sz="4" w:color="94A3B8"/>`
              + `<w:left w:val="single" w:sz="4" w:color="94A3B8"/>`
              + `<w:bottom w:val="single" w:sz="4" w:color="94A3B8"/>`
              + `<w:right w:val="single" w:sz="4" w:color="94A3B8"/>`
              + `<w:insideH w:val="single" w:sz="4" w:color="94A3B8"/>`
              + `<w:insideV w:val="single" w:sz="4" w:color="94A3B8"/>`
              + `</w:tblBorders></w:tblPr>`;

  const rowsXml = rows.map(tr => {
    const cells = tr.children.filter(c => c.tag === 'td' || c.tag === 'th').map(cell => {
      const isHdr  = cell.tag === 'th';
      const runs   = inlineToRuns(cell.children, { bold: isHdr });
      const shading = isHdr
        ? `<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>`
        : '';
      return `<w:tc>`
           + (shading ? `<w:tcPr>${shading}</w:tcPr>` : '')
           + `<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto" w:after="0"/><w:keepLines/></w:pPr>${runs}</w:p>`
           + `</w:tc>`;
    }).join('');
    return `<w:tr>${cells}</w:tr>`;
  }).join('');

  return `<w:tbl>${tblPr}${rowsXml}</w:tbl>`;
}

// ─── Top-level HTML → OOXML ───────────────────────────────────────────────────
// opts.proLayout — true for PRO documents: inserts page breaks at section boundaries
function htmlToOoxml(html, opts = {}) {
  if (!html || !html.trim()) return '<w:p/>';
  const tokens = tokenizeHtml(html);
  const tree   = buildTree(tokens);
  return blocksToOoxml(tree.children, opts);
}

// ─── DOCX body replacement ────────────────────────────────────────────────────
function extractSectPr(docXml) {
  const m = docXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
  return m ? m[0] : '';
}

// Extracts the branded header block from a body XML string.
// Returns the Preqal branded header tables from a document body.
// A table qualifies as a header table if it contains the all-caps "PREQAL"
// branding OR the "Document No" metadata label.
// IMPORTANT: PREQAL check is case-sensitive — body text uses "Preqal" (mixed
// case) so a case-insensitive match would include nearly every table.
function extractBodyHeader(bodyXml) {
  const isHeaderTable = (t) => /PREQAL/.test(t) || /Document No/i.test(t);
  let cursor = 0;
  let prevEnd = 0;
  for (let i = 0; i < 3; i++) {
    const end = bodyXml.indexOf('</w:tbl>', cursor);
    if (end < 0) break;
    const tableText = bodyXml.slice(cursor, end + 8).replace(/<[^>]+>/g, ' ');
    if (!isHeaderTable(tableText)) break;
    prevEnd = end + 8;
    cursor = prevEnd;
  }
  return bodyXml.slice(0, prevEnd);
}

// Returns the body XML string (inner content, no <w:body> tags) from a document.xml string.
function getBodyContent(docXml) {
  const m = docXml.match(/<w:body(?:\s[^>]*)?>[\s\S]*?<\/w:body>/);
  if (!m) return '';
  const open = m[0].indexOf('>') + 1;
  return m[0].slice(open, -9); // strip <w:body...> and </w:body>
}

// Extracts the Preqal branded header (title + metadata tables) from the
// git history baseline, where all DOCX files still have their original
// PREQAL branding intact. Falls back to the current public/ims/ file or
// the QMS working folder if the file didn't exist at the baseline commit.
const HEADER_BASELINE_COMMIT = '28147ea'; // commit with original PREQAL-branded headers
async function getQmsHeaderXml(docId, rawFilename) {
  const headerFromBuf = async (buf) => {
    try {
      const zip = await JSZip.loadAsync(buf);
      const docXml = await zip.file('word/document.xml').async('string');
      return extractBodyHeader(getBodyContent(docXml));
    } catch (_) { return ''; }
  };

  // 1. Git history baseline is the authoritative source for branding headers
  try {
    const gitBuf = require('child_process').execSync(
      `git show ${HEADER_BASELINE_COMMIT}:public/ims/${rawFilename}`,
      { cwd: path.resolve(__dirname, '..') }
    );
    const h = await headerFromBuf(gitBuf);
    if (h) return h;
  } catch (_) { /* file may not exist at that commit */ }

  // 2. Fall back to current public/ims/ file
  const imsPath = path.join(IMS_DIR, rawFilename);
  if (fs.existsSync(imsPath)) {
    const h = await headerFromBuf(fs.readFileSync(imsPath));
    if (h) return h;
  }

  // 3. Fall back to QMS working folder
  const prefix = (docId || '').split('-')[0];
  const subdir = QMS_SUBDIR[prefix];
  if (!subdir) return '';
  const qmsPath = path.join(QMS_DIR, subdir, rawFilename);
  if (!fs.existsSync(qmsPath)) return '';
  return headerFromBuf(fs.readFileSync(qmsPath));
}

function patchDocxBody(originalXml, newBodyContent, headerXml) {
  const sectPr  = extractSectPr(originalXml);
  const header  = headerXml != null ? headerXml : extractBodyHeader(getBodyContent(originalXml));
  const newBody = `<w:body>${header}${newBodyContent}${sectPr}</w:body>`;
  const patched = originalXml.replace(/<w:body(?:\s[^>]*)?>[\s\S]*<\/w:body>/, () => newBody);
  if (!/<w:body(?:\s[^>]*)?>[\s\S]*<\/w:body>/.test(originalXml)) {
    throw new Error('<w:body> not found in document.xml');
  }
  return patched;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    console.error('\nERROR: SUPABASE_SERVICE_KEY is not set.');
    console.error('Usage: SUPABASE_SERVICE_KEY=<key> node scripts/pull-web-edits.cjs [--apply] [--clear]\n');
    process.exit(1);
  }

  const sb = createClient(SUPABASE_URL, key);

  const { data: docs, error } = await sb
    .from('qms_documents')
    .select('id, doc_id, title, file_url, content_html')
    .is('client_id', null)
    .not('content_html', 'is', null)
    .order('doc_id');

  if (error) {
    console.error('\n✗  Supabase query failed:', error.message, '\n');
    process.exit(1);
  }

  if (!docs || docs.length === 0) {
    console.log('\n✅  No browser edits found — all documents are in sync.\n');
    return;
  }

  console.log(`\n${APPLY ? '🔧' : '🔍'}  ${APPLY ? 'Applying' : 'Previewing'} browser edits in ${docs.length} document(s)…\n`);

  const results = [];

  for (const doc of docs) {
    const docId = doc.doc_id || '(no id)';
    const title = doc.title  || '(no title)';
    const rawFilename = (doc.file_url || '').split('/').pop();

    if (!rawFilename || /[\\/]/.test(rawFilename)) {
      results.push({ doc_id: docId, title, status: 'SKIP', detail: 'Invalid filename in file_url' });
      continue;
    }
    if (!rawFilename.endsWith('.docx')) {
      results.push({ doc_id: docId, title, status: 'SKIP', detail: 'Not a DOCX — sync not applicable' });
      continue;
    }

    const localPath = path.join(IMS_DIR, rawFilename);
    if (!localPath.startsWith(IMS_DIR + path.sep)) {
      results.push({ doc_id: docId, title, status: 'SKIP', detail: 'Path escapes IMS_DIR' });
      continue;
    }
    if (!fs.existsSync(localPath)) {
      results.push({ doc_id: docId, title, status: 'SKIP', detail: `File not found: public/ims/${rawFilename}` });
      continue;
    }

    if (!APPLY) {
      results.push({ doc_id: docId, title, status: 'WOULD_PATCH', detail: 'Browser edits pending — run --apply to sync' });
      continue;
    }

    // Load DOCX as ZIP
    let zip;
    try {
      zip = await JSZip.loadAsync(fs.readFileSync(localPath));
    } catch (e) {
      results.push({ doc_id: docId, title, status: 'FAIL', detail: `Cannot open DOCX: ${e.message}` });
      continue;
    }

    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) {
      results.push({ doc_id: docId, title, status: 'FAIL', detail: 'word/document.xml not found in DOCX' });
      continue;
    }

    const originalXml = await docXmlFile.async('string');

    // Get branded header from QMS folder master file (fallback: extract from current file)
    const headerXml = await getQmsHeaderXml(docId, rawFilename);

    // Convert HTML to OOXML and replace body
    let patchedXml;
    try {
      const newBodyContent = htmlToOoxml(doc.content_html, { proLayout: docId.startsWith('PRO-') });
      patchedXml = patchDocxBody(originalXml, newBodyContent, headerXml);
    } catch (e) {
      results.push({ doc_id: docId, title, status: 'FAIL', detail: `Conversion failed: ${e.message}` });
      continue;
    }

    // Repack DOCX
    zip.file('word/document.xml', patchedXml);
    let patchedBuf;
    try {
      patchedBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    } catch (e) {
      results.push({ doc_id: docId, title, status: 'FAIL', detail: `DOCX repack failed: ${e.message}` });
      continue;
    }

    // Atomic write to public/ims/
    const tmpPath = localPath + '.sync.tmp';
    try {
      fs.writeFileSync(tmpPath, patchedBuf);
      fs.renameSync(tmpPath, localPath);
    } catch (e) {
      try { fs.unlinkSync(tmpPath); } catch (_) {}
      results.push({ doc_id: docId, title, status: 'FAIL', detail: `Write failed: ${e.message}` });
      continue;
    }

    // Mirror to QMS working folder if the file exists there
    const prefix = (docId || '').split('-')[0];
    const qmsSubdir = QMS_SUBDIR[prefix];
    let qmsCopied = false;
    if (qmsSubdir) {
      const qmsPath = path.join(QMS_DIR, qmsSubdir, rawFilename);
      if (fs.existsSync(qmsPath)) {
        try {
          fs.writeFileSync(qmsPath, patchedBuf);
          qmsCopied = true;
        } catch (_) {}
      }
    }

    let detail = `Body replaced from browser edits (header preserved${qmsCopied ? ', QMS folder updated' : ''})`;

    if (CLEAR) {
      const { error: clearErr } = await sb
        .from('qms_documents')
        .update({ content_html: null })
        .eq('id', doc.id);
      detail += clearErr ? `  |  DB clear failed: ${clearErr.message}` : '  |  DB draft cleared';
    }

    results.push({ doc_id: docId, title, status: 'PATCHED', detail });
  }

  // ─── Report ─────────────────────────────────────────────────────────────────
  const C_ID = 10, C_TIT = 36, C_ST = 14;
  console.log('  ' + 'Doc ID'.padEnd(C_ID) + 'Title'.padEnd(C_TIT) + 'Status'.padEnd(C_ST) + 'Detail');
  console.log('  ' + '─'.repeat(C_ID + C_TIT + C_ST + 40));

  const ICON = { PATCHED: '✅', WOULD_PATCH: '📝', SKIP: '⟳ ', FAIL: '✗ ' };
  for (const r of results) {
    const icon = ICON[r.status] || '  ';
    console.log(
      '  ' + (r.doc_id || '').padEnd(C_ID)
           + (r.title  || '').slice(0, C_TIT - 1).padEnd(C_TIT)
           + (icon + ' ' + r.status).padEnd(C_ST + 3)
           + r.detail
    );
  }

  const patched    = results.filter(r => r.status === 'PATCHED').length;
  const wouldPatch = results.filter(r => r.status === 'WOULD_PATCH').length;
  console.log('\n' + '─'.repeat(80));
  if (!APPLY) {
    console.log(wouldPatch > 0
      ? `\n  ${wouldPatch} document(s) have pending browser edits.\n  Run with --apply to sync all edits into local DOCX files.\n`
      : `\n  All documents are in sync.\n`
    );
  } else {
    console.log(`\n  Patched : ${patched}`);
    if (CLEAR && patched > 0) console.log(`  DB draft cleared for ${patched} document(s).`);
    if (patched > 0) console.log(`\n  Next: git add public/ims/ && git commit -m "sync: apply browser edits to IMS docs" && git push origin master --no-verify\n`);
  }
}

main().catch(err => {
  console.error('\n✗ ', err.message || err);
  process.exit(1);
});

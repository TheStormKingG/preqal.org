#!/usr/bin/env node
/**
 * Banned-vocabulary gate for reader-facing copy.
 *
 * WHY THIS PARSES INSTEAD OF GREPPING
 * A plain grep over these directories reports five hits, and only one of them is
 * prose: two are a fictional company name in a form placeholder ("Greenfield
 * Solutions Ltd.") and two are a JavaScript identifier (`const unlock =
 * useCallback(...)` in components/SlideDeck.tsx). A gate that fails the build on
 * a variable name gets switched off within a week, so this walks the TypeScript
 * AST and looks only at nodes that can reach a reader.
 *
 * SOURCE OF TRUTH
 * The term list is parsed out of docs/guides/blog-protocol.md — the "**Banned
 * vocabulary**" line. It is deliberately NOT restated here: the guide is the
 * contract, and a second copy of the list is a second thing to forget.
 *
 * WHAT COUNTS AS PROSE (the gate's blind spots, stated so they are reviewable)
 *   scanned  - JSX text nodes (the visible words between tags)
 *            - string and template literals, EXCEPT the skips below
 *   skipped  - module specifiers (import/export/require/dynamic import)
 *            - JSX attributes other than COPY_ATTRS, because attributes are
 *              overwhelmingly machine values and JSX text already covers prose
 *            - object keys and variable names in SKIP_KEYS (routes, ids, class
 *              names, asset paths — values a reader never sees as words)
 *   So: copy hidden in, say, a `className` or a `slug` is invisible to this
 *   check by design. It gates reader-facing words, nothing more.
 *
 * Usage:  node scripts/check-banned-vocabulary.mjs [dir ...]
 *         (defaults to the three directories the guide scopes the rule to)
 * Exit:   0 clean, 1 violations found, 2 the check itself could not run
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const GUIDE = 'docs/guides/blog-protocol.md';
const DEFAULT_DIRS = ['pages', 'data', 'components'];

/** JSX attributes whose value a reader (or a screen reader) actually hears. */
const COPY_ATTRS = new Set([
  'alt', 'title', 'placeholder', 'label', 'summary', 'content',
  'aria-label', 'aria-description', 'aria-placeholder', 'aria-roledescription',
]);

/** Object keys / variable names that hold machine values, not words. */
const SKIP_KEYS = new Set([
  'href', 'to', 'path', 'src', 'srcset', 'srcSet', 'sizes', 'slug', 'id', 'key',
  'classname', 'className', 'class', 'rel', 'target', 'type', 'icon', 'url',
  'testid', 'testId', 'datatestid', 'name', 'value', 'ref', 'as', 'role',
]);

/**
 * Deliberate exceptions. Each needs a reason a reviewer can disagree with.
 * Matched on all three fields, so an entry cannot blanket-exempt a file.
 */
const ALLOWED = [
  {
    file: 'pages/BusinessGrowthAssessment.tsx',
    term: 'solutions',
    contains: 'Greenfield Solutions Ltd',
    reason: 'Fictional company name in a form placeholder, not Preqal voice.',
  },
  {
    file: 'pages/QuoteClassifier.tsx',
    term: 'solutions',
    contains: 'Greenfield Solutions Ltd',
    reason: 'Fictional company name in a form placeholder, not Preqal voice.',
  },
];

function fail(msg) {
  console.error(`banned-vocabulary: ${msg}`);
  process.exit(2);
}

/** Parse the term list out of the guide. The guide is the contract. */
function loadTerms() {
  let md;
  try {
    md = readFileSync(join(ROOT, GUIDE), 'utf8');
  } catch {
    fail(`cannot read ${GUIDE} — the term list lives there, so the check cannot run.`);
  }
  const line = md.split('\n').find((l) => l.startsWith('**Banned vocabulary**'));
  if (!line) fail(`${GUIDE} has no "**Banned vocabulary**" line to parse.`);
  // The terms are the "·"-separated run at the end of the line. Anchor on the
  // first separator and walk back to the colon before it, so a colon in the
  // sentence itself (a command name, say) cannot swallow half the list.
  const sep = line.indexOf('·');
  if (sep === -1) fail(`${GUIDE}'s banned-vocabulary line has no "·" separators to split on.`);
  const colon = line.lastIndexOf(':', sep);
  if (colon === -1) fail(`${GUIDE}'s banned-vocabulary line has no ":" before the term list.`);
  const tail = line.slice(colon + 1);
  const terms = tail
    .split('·')
    .map((t) => t.trim().replace(/[.。]+$/, '').replace(/^["'`]|["'`]$/g, '').trim())
    .filter(Boolean);
  if (terms.length < 5) {
    fail(`parsed only ${terms.length} term(s) from ${GUIDE} — the list format changed.`);
  }
  return terms;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Word-boundary match that still works for hyphenated and apostrophised terms. */
const matcher = (term) =>
  new RegExp(`(?<![\\p{L}\\d])${esc(term).replace(/\s+/g, '\\s+')}(?![\\p{L}\\d])`, 'iu');

function walkFiles(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (e === 'node_modules' || e.startsWith('.')) continue;
      walkFiles(p, out);
    } else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(e))) {
      if (/\.(test|spec)\.[jt]sx?$/.test(e)) continue;
      out.push(p);
    }
  }
}

/** Climb to the name that governs this literal, to decide prose vs machine value. */
function governingName(node) {
  let n = node.parent;
  while (n && (ts.isArrayLiteralExpression(n) || ts.isParenthesizedExpression(n) ||
               ts.isConditionalExpression(n) || ts.isBinaryExpression(n) ||
               ts.isJsxExpression(n))) {
    n = n.parent;
  }
  if (!n) return { kind: 'other' };
  if (ts.isJsxAttribute(n)) {
    return { kind: 'jsxAttr', name: n.name.getText ? undefined : undefined, raw: n.name };
  }
  if (ts.isPropertyAssignment(n)) {
    const k = n.name;
    const name = ts.isIdentifier(k) || ts.isStringLiteral(k) ? k.text : undefined;
    return { kind: 'prop', name };
  }
  if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
    return { kind: 'var', name: n.name.text };
  }
  if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n) ||
      ts.isImportTypeNode(n) || ts.isExternalModuleReference(n)) {
    return { kind: 'module' };
  }
  if (ts.isCallExpression(n) &&
      (n.expression.kind === ts.SyntaxKind.ImportKeyword ||
       (ts.isIdentifier(n.expression) && n.expression.text === 'require'))) {
    return { kind: 'module' };
  }
  return { kind: 'other' };
}

function jsxAttrName(node) {
  let n = node.parent;
  while (n && ts.isJsxExpression(n)) n = n.parent;
  if (n && ts.isJsxAttribute(n)) {
    const nm = n.name;
    return ts.isIdentifier(nm) ? nm.text : nm.getText?.() ?? String(nm.escapedText ?? '');
  }
  return null;
}

function collectProse(file, src) {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const prose = [];
  const push = (node, text) => {
    if (text && text.trim()) prose.push({ pos: node.getStart(sf), text });
  };
  const visit = (node) => {
    if (ts.isJsxText(node)) {
      push(node, node.text);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ||
               ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const attr = jsxAttrName(node);
      if (attr !== null) {
        if (COPY_ATTRS.has(attr)) push(node, node.text);
      } else {
        const g = governingName(node);
        if (g.kind === 'module') { /* machine */ }
        else if (g.name && SKIP_KEYS.has(g.name)) { /* machine */ }
        else push(node, node.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { sf, prose };
}

// ---------------------------------------------------------------------------
const dirs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_DIRS;
const terms = loadTerms().map((t) => ({ term: t, re: matcher(t) }));

const files = [];
for (const d of dirs) walkFiles(resolve(ROOT, d), files);
if (files.length === 0) {
  fail(`scanned 0 files under ${dirs.join(', ')} — a check that reads nothing proves nothing.`);
}

const findings = [];
const allowedHits = [];
let proseNodes = 0;

for (const file of files) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, 'utf8');
  const { sf, prose } = collectProse(file, src);
  proseNodes += prose.length;
  for (const chunk of prose) {
    for (const { term, re } of terms) {
      const m = re.exec(chunk.text);
      if (!m) continue;
      const { line } = sf.getLineAndCharacterOfPosition(chunk.pos);
      const exempt = ALLOWED.find(
        (a) => a.file === rel && a.term.toLowerCase() === term.toLowerCase() &&
               chunk.text.includes(a.contains),
      );
      const hit = {
        rel, line: line + 1, term,
        snippet: chunk.text.replace(/\s+/g, ' ').trim().slice(0, 100),
      };
      if (exempt) allowedHits.push({ ...hit, reason: exempt.reason });
      else findings.push(hit);
    }
  }
}

console.log(
  `banned-vocabulary: ${terms.length} terms from ${GUIDE} · ` +
  `${files.length} files · ${proseNodes} prose nodes · ` +
  `${dirs.join(', ')}`,
);

for (const a of allowedHits) {
  console.log(`  allowed  ${a.rel}:${a.line}  "${a.term}" — ${a.reason}`);
}

if (findings.length === 0) {
  console.log('banned-vocabulary: clean.');
  process.exit(0);
}

console.error('');
for (const f of findings) {
  console.error(`  ${f.rel}:${f.line}  banned word "${f.term}"`);
  console.error(`      ${f.snippet}`);
}
console.error(
  `\nbanned-vocabulary: ${findings.length} violation(s). ` +
  `The list is in ${GUIDE}; rewrite the copy, or add a reasoned entry to ALLOWED ` +
  `in scripts/check-banned-vocabulary.mjs if the word is a proper noun.`,
);
process.exit(1);

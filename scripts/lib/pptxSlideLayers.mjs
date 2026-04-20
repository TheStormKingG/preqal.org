/**
 * Reads PPTX OOXML (already unzipped) and emits browser-ready slide layer JSON:
 * positioned rects, images, and text runs approximating the deck layout.
 */
import fs from 'node:fs';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import sharp from 'sharp';

const XML = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
});

const WRAPPER_NS =
  'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" ' +
  'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';

export function readSlideSizeEmu(presentationXmlPath) {
  const j = XML.parse(fs.readFileSync(presentationXmlPath, 'utf8'));
  const sz = j.presentation?.sldSz;
  const cx = Number(sz?.['@_cx'] || 0);
  const cy = Number(sz?.['@_cy'] || 0);
  if (!cx || !cy) throw new Error('[pptxSlideLayers] Missing p:sldSz in presentation.xml');
  return { cx, cy };
}

/** Resolve image targets relative to the slide part folder (`ppt/slides/`), not `_rels/`. */
export function loadSlideRelsMap(relsFilePath) {
  const slidesDir = path.join(path.dirname(relsFilePath), '..');
  const j = XML.parse(fs.readFileSync(relsFilePath, 'utf8'));
  const rels = j.Relationships?.Relationship;
  const list = Array.isArray(rels) ? rels : rels ? [rels] : [];
  const map = new Map();
  for (const r of list) {
    const id = r['@_Id'];
    const type = r['@_Type'];
    const target = r['@_Target'];
    if (!id || !target) continue;
    if (!String(type || '').includes('/image')) continue;
    const abs = path.normalize(path.join(slidesDir, target));
    map.set(id, abs);
  }
  return map;
}

function decodeXmlText(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9A-Fa-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)));
}

function asArray(x) {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function emuBox(spPr) {
  const xf = spPr?.xfrm;
  if (!xf) return null;
  const off = xf.off;
  const ext = xf.ext;
  if (!off || !ext) return null;
  return {
    x: num(off['@_x']),
    y: num(off['@_y']),
    cx: num(ext['@_cx']),
    cy: num(ext['@_cy']),
  };
}

/** Layout box in reference pixels (fixed slide width) for CSS transform scaling in the browser. */
function toRefPx(box, slideCx, slideCy, refW) {
  const refH = (slideCy / slideCx) * refW;
  return {
    left: (box.x / slideCx) * refW,
    top: (box.y / slideCy) * refH,
    width: (box.cx / slideCx) * refW,
    height: (box.cy / slideCy) * refH,
  };
}

function srgbToCss(clr) {
  if (!clr) return null;
  const v = clr['@_val'];
  if (!v) return null;
  const hex = String(v).replace(/[^0-9A-Fa-f]/g, '');
  if (hex.length !== 6) return `#${v}`;
  const alphaRaw = clr.alpha?.['@_val'];
  if (alphaRaw != null) {
    const a = Math.max(0, Math.min(1, Number(alphaRaw) / 100000));
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return `#${hex}`;
}

function fillFromSpPr(spPr) {
  const sf = spPr?.solidFill;
  if (sf?.srgbClr) return srgbToCss(sf.srgbClr);
  return null;
}

function strokeFromSpPr(spPr) {
  const ln = spPr?.ln;
  if (!ln) return { color: null, widthEmu: 0 };
  const wEmu = num(ln['@_w']);
  const solid = ln.solidFill?.srgbClr;
  return { color: solid ? srgbToCss(solid) : null, widthEmu: wEmu };
}

/** Approximate round-rect corner radius in reference px. */
function cornerRadiusPxFromEmu(boxCyEmu, slideCyEmu, refH) {
  const hPx = (boxCyEmu / slideCyEmu) * refH;
  return Math.max(3, Math.min(32, hPx * 0.06));
}

function mapAlign(algn) {
  if (algn === 'ctr') return 'center';
  if (algn === 'r') return 'right';
  if (algn === 'just' || algn === 'justLow') return 'justify';
  return 'left';
}

function mapAnchor(anchor) {
  if (anchor === 'ctr') return 'middle';
  if (anchor === 'b') return 'bottom';
  return 'top';
}

function cssFont(typeface) {
  if (!typeface) return 'system-ui, sans-serif';
  const t = String(typeface);
  if (/^Saira/i.test(t)) return '"Saira", system-ui, sans-serif';
  if (/^Roboto/i.test(t)) return '"Roboto", system-ui, sans-serif';
  const safe = JSON.stringify(t);
  return `${safe}, system-ui, sans-serif`;
}

function runStyle(rPr, fallback) {
  const base = rPr || fallback || {};
  const sz = num(base['@_sz']);
  const fontSizePt = sz ? sz / 100 : fallback ? num(fallback['@_sz']) / 100 : 12;
  const color = srgbToCss(base.solidFill?.srgbClr) || '#000000';
  const latin = base.latin?.['@_typeface'] || base.ea?.['@_typeface'] || base.cs?.['@_typeface'];
  const fontFamily = cssFont(latin);
  const fontWeight = base['@_b'] === '1' || base['@_b'] === 'true' ? 700 : 400;
  const fontStyle = base['@_i'] === '1' || base['@_i'] === 'true' ? 'italic' : 'normal';
  return { fontSizePt, color, fontFamily, fontWeight, fontStyle };
}

function paragraphLineSpacingPt(pPr) {
  const v = pPr?.lnSpc?.spcPts?.['@_val'];
  if (v == null) return undefined;
  return Number(v) / 100;
}

function extractParagraphs(txBody) {
  const paras = asArray(txBody?.p);
  const out = [];
  for (const p of paras) {
    const end = p.endParaRPr;
    const pPrRaw = p.pPr;
    const pPrList = Array.isArray(pPrRaw) ? pPrRaw : pPrRaw ? [pPrRaw] : [];
    const firstPPr = pPrList[0] || {};
    const align = mapAlign(firstPPr['@_algn'] || 'l');
    const defaultLine = paragraphLineSpacingPt(firstPPr);

    const runsRaw = p.r;
    const runsArr = Array.isArray(runsRaw) ? runsRaw : runsRaw ? [runsRaw] : [];
    const runs = [];
    for (let i = 0; i < runsArr.length; i += 1) {
      const r = runsArr[i];
      const pprForRun = pPrList[i] || firstPPr;
      const lineForRun = paragraphLineSpacingPt(pprForRun) ?? defaultLine;
      const text = decodeXmlText(r?.t);
      if (text === '' && runsArr.length > 1) continue;
      const st = runStyle(r?.rPr, end);
      runs.push({
        text,
        lineSpacingPt: lineForRun,
        fontSizePt: st.fontSizePt,
        color: st.color,
        fontFamily: st.fontFamily,
        fontWeight: st.fontWeight,
        fontStyle: st.fontStyle,
      });
    }
    if (runs.length === 0) continue;
    out.push({
      align,
      lineSpacingPt: defaultLine,
      runs,
    });
  }
  return out;
}

function extractOrderedShapeXmls(slideXml) {
  const m = slideXml.match(/<p:spTree[^>]*>([\s\S]*)<\/p:spTree>/);
  if (!m) return [];
  const inner = m[1];
  const re = /<p:(sp|pic)\b[\s\S]*?<\/p:\1>/g;
  const segs = [];
  let x;
  while ((x = re.exec(inner))) {
    segs.push({ type: x[1], xml: x[0] });
  }
  return segs;
}

function parseShapeFragment(segmentXml) {
  const wrapped = `<?xml version="1.0"?><frag ${WRAPPER_NS}>${segmentXml}</frag>`;
  return XML.parse(wrapped).frag;
}

function shapeFragmentRoot(parsed) {
  if (parsed.sp) return { kind: 'sp', node: asArray(parsed.sp)[0] };
  if (parsed.pic) return { kind: 'pic', node: asArray(parsed.pic)[0] };
  return null;
}

/** Async: waits for all sharp image exports; returns slide JSON for the browser. */
export async function extractSlideLayersAsync(opts) {
  const slideXml = fs.readFileSync(opts.slideXmlPath, 'utf8');
  const relMap = loadSlideRelsMap(opts.relsPath);
  const segs = extractOrderedShapeXmls(slideXml);
  const layers = [];
  const writes = [];
  let z = 0;
  const { slideCx, slideCy, outDir, slideStem, publicUrlDir } = opts;
  const refW = opts.refWidth ?? 1920;
  const refH = (slideCy / slideCx) * refW;

  for (const seg of segs) {
    const frag = parseShapeFragment(seg.xml);
    const root = shapeFragmentRoot(frag);
    if (!root) continue;

    if (root.kind === 'pic') {
      const pic = root.node;
      const box = emuBox(pic.spPr);
      if (!box) continue;
      const embed = pic.blipFill?.blip?.['@_embed'];
      if (!embed) continue;
      const srcAbs = relMap.get(embed);
      if (!srcAbs || !fs.existsSync(srcAbs)) continue;
      if (!/\.(png|jpe?g|gif|webp|bmp|tif)$/i.test(srcAbs)) continue;
      const outName = `${slideStem}-${embed}.webp`;
      const outPath = path.join(outDir, outName);
      writes.push(
        sharp(srcAbs)
          .resize({ width: 2200, withoutEnlargement: true })
          .webp({ quality: 86 })
          .toFile(outPath)
      );
      layers.push({
        type: 'image',
        z: z++,
        ...toRefPx(box, slideCx, slideCy, refW),
        src: `${publicUrlDir}/${outName}`,
      });
      continue;
    }

    const sp = root.node;
    const spPr = sp.spPr;
    const box = emuBox(spPr);
    if (!box) continue;
    const px = toRefPx(box, slideCx, slideCy, refW);
    const txBody = sp.txBody;
    if (txBody) {
      const paragraphs = extractParagraphs(txBody);
      const joined = paragraphs.map((p) => p.runs.map((r) => r.text).join('')).join('\n').trim();
      if (!joined) continue;
      const bg = fillFromSpPr(spPr);
      const prst = spPr?.prstGeom?.['@_prst'];
      const borderRadiusPx = prst === 'roundRect' ? cornerRadiusPxFromEmu(box.cy, slideCy, refH) : 0;
      const bodyPr = txBody.bodyPr;
      const verticalAlign = mapAnchor(bodyPr?.['@_anchor'] || 't');
      layers.push({
        type: 'text',
        z: z++,
        ...px,
        align: paragraphs[0]?.align || 'left',
        verticalAlign,
        background: bg || undefined,
        borderRadiusPx: borderRadiusPx || undefined,
        paragraphs,
      });
      continue;
    }

    const fill = fillFromSpPr(spPr);
    const stroke = strokeFromSpPr(spPr);
    const strokeW = stroke.widthEmu ? (stroke.widthEmu * refW) / slideCx : 0;
    if (!fill && !(stroke.color && strokeW)) continue;
    const prst = spPr?.prstGeom?.['@_prst'];
    const borderRadiusPx = prst === 'roundRect' ? cornerRadiusPxFromEmu(box.cy, slideCy, refH) : 0;
    layers.push({
      type: 'rect',
      z: z++,
      ...px,
      fill: fill || 'transparent',
      stroke: stroke.color || undefined,
      strokeWidthPx: strokeW || undefined,
      borderRadiusPx: borderRadiusPx || undefined,
    });
  }

  await Promise.all(writes);
  return {
    version: 2,
    widthEmu: slideCx,
    heightEmu: slideCy,
    refWidth: refW,
    refHeight: refH,
    layers,
  };
}

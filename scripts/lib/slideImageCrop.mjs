/**
 * Pixels to remove from the bottom of slide exports (e.g. “Made with Gamma” bar).
 * Override: CROP_BOTTOM_PX=96 node …
 */
import sharp from 'sharp';

export function cropBottomPx() {
  const n = Number(process.env.CROP_BOTTOM_PX);
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  return 80;
}

/** Resize to max width, then crop strip from bottom; writes WebP. */
export async function resizeWebpCropBottom(srcPath, outPath, { maxWidth = 1920, quality = 88 } = {}) {
  const buf = await sharp(srcPath).resize({ width: maxWidth, withoutEnlargement: true }).toBuffer();
  const m = await sharp(buf).metadata();
  const w = m.width ?? 0;
  const h = m.height ?? 0;
  const strip = Math.min(cropBottomPx(), Math.max(0, h - 1));
  const newH = Math.max(1, h - strip);
  await sharp(buf)
    .extract({ left: 0, top: 0, width: w, height: newH })
    .webp({ quality })
    .toFile(outPath);
}

/** Crop bottom strip off an existing WebP in place. */
export async function cropExistingWebpBottom(webpPath) {
  const m = await sharp(webpPath).metadata();
  const w = m.width ?? 0;
  const h = m.height ?? 0;
  const strip = Math.min(cropBottomPx(), Math.max(0, h - 1));
  const newH = Math.max(1, h - strip);
  const tmp = `${webpPath}.tmp.webp`;
  await sharp(webpPath)
    .extract({ left: 0, top: 0, width: w, height: newH })
    .webp({ quality: 88 })
    .toFile(tmp);
  const fs = await import('node:fs');
  fs.renameSync(tmp, webpPath);
}

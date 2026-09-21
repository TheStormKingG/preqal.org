// Node.js script to convert images to AVIF and WebP using Sharp
// Run: node scripts/convert-images.js
// Requires: npm install sharp --save-dev

import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const publicDir = 'public';

/* The content images the pages actually render. Each entry lists its output
   files by name rather than deriving them, because the hero's source is
   already called -1040 and a derived name silently produced an orphan
   (hero-bg.avif) that no markup referenced. The names here are the exact
   strings the <picture> elements in Home.tsx and the preload in index.html
   ask for; changing one without the other breaks the srcset quietly. */
const responsive = [
  { input: 'images/hero-bg-1040.webp', variants: [
      { name: 'images/hero-bg-640.avif',  width: 640 },
      { name: 'images/hero-bg-640.webp',  width: 640 },
      { name: 'images/hero-bg-1040.avif', width: 1040 },
  ] },
  ...['business-team', 'services/phase1-diagnose', 'services/phase2-train',
      'services/phase3-audit', 'case-studies/poultry'].map((stem) => ({
    input: `images/${stem}.webp`,
    variants: [
      { name: `images/${stem}-600.avif`, width: 600 },
      { name: `images/${stem}-600.webp`, width: 600 },
      { name: `images/${stem}.avif`,     width: 900 },
    ],
  })),
];

const conversions = [
  {
    input: 'Image1.png',
    outputs: [
      { name: 'Image1-480.webp', width: 480, format: 'webp' },
      { name: 'Image1-480.avif', width: 480, format: 'avif' },
      { name: 'Image1-768.webp', width: 768, format: 'webp' },
      { name: 'Image1-768.avif', width: 768, format: 'avif' },
      { name: 'Image1-1024.webp', width: 1024, format: 'webp' },
      { name: 'Image1-1024.avif', width: 1024, format: 'avif' },
      { name: 'Image1-1280.webp', width: 1280, format: 'webp' },
      { name: 'Image1-1280.avif', width: 1280, format: 'avif' },
      { name: 'Image1-1920.webp', width: 1920, format: 'webp' },
      { name: 'Image1-1920.avif', width: 1920, format: 'avif' }
    ],
    quality: 85
  },
  {
    input: 'Preqal Logo Sep25-9.png',
    outputs: [
      { name: 'Preqal Logo Sep25-9-200.webp', width: 200, format: 'webp' },
      { name: 'Preqal Logo Sep25-9-200.avif', width: 200, format: 'avif' },
      { name: 'Preqal Logo Sep25-9-400.webp', width: 400, format: 'webp' },
      { name: 'Preqal Logo Sep25-9-400.avif', width: 400, format: 'avif' },
      { name: 'Preqal Logo Sep25-9.webp', width: null, format: 'webp' },
      { name: 'Preqal Logo Sep25-9.avif', width: null, format: 'avif' }
    ],
    quality: 90
  },
  {
    input: 'Stefan Signature-3 (5).png',
    outputs: [
      { name: 'Stefan Signature-3 (5)-128.webp', width: 128, format: 'webp' },
      { name: 'Stefan Signature-3 (5)-128.avif', width: 128, format: 'avif' },
      { name: 'Stefan Signature-3 (5)-256.webp', width: 256, format: 'webp' },
      { name: 'Stefan Signature-3 (5)-256.avif', width: 256, format: 'avif' }
    ],
    quality: 90
  },
  {
    input: 'Stefan Signature-6.png',
    outputs: [
      { name: 'Stefan Signature-6-300.webp', width: 300, format: 'webp' },
      { name: 'Stefan Signature-6-300.avif', width: 300, format: 'avif' },
      { name: 'Stefan Signature-6-600.webp', width: 600, format: 'webp' },
      { name: 'Stefan Signature-6-600.avif', width: 600, format: 'avif' }
    ],
    quality: 90
  },
  {
    input: 'stashway-logo.png',
    outputs: [
      { name: 'stashway-logo-200.webp', width: 200, format: 'webp' },
      { name: 'stashway-logo-200.avif', width: 200, format: 'avif' },
      { name: 'stashway-logo-400.webp', width: 400, format: 'webp' },
      { name: 'stashway-logo-400.avif', width: 400, format: 'avif' }
    ],
    quality: 90
  }
];

async function convertImages() {
  console.log('🖼️  Converting images to AVIF and WebP...\n');

  for (const r of responsive) {
    const inputPath = join(publicDir, r.input);
    for (const v of r.variants) {
      const outputPath = join(publicDir, v.name);
      if (v.name === r.input) continue; // never re-encode a source over itself
      const opts = v.name.endsWith('.avif') ? { quality: 58, effort: 6 } : { quality: 80 };
      const format = v.name.endsWith('.avif') ? 'avif' : 'webp';
      await sharp(inputPath).resize({ width: v.width, withoutEnlargement: true })[format](opts).toFile(outputPath);
      console.log(`  ${v.name}`);
    }
  }

  for (const conversion of conversions) {
    const inputPath = join(publicDir, conversion.input);
    
    try {
      for (const output of conversion.outputs) {
        const outputPath = join(publicDir, output.name);
        
        let pipeline = sharp(inputPath);
        
        if (output.width) {
          pipeline = pipeline.resize(output.width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          });
        }
        
        if (output.format === 'avif') {
          await pipeline
            .avif({ quality: conversion.quality })
            .toFile(outputPath);
        } else {
          await pipeline
            .webp({ quality: conversion.quality })
            .toFile(outputPath);
        }
        
        console.log(`✓ Created: ${output.name}`);
      }
    } catch (error) {
      console.error(`✗ Error converting ${conversion.input}:`, error.message);
    }
  }
  
  console.log('\n✅ Image conversion complete!');
}

convertImages().catch(console.error);


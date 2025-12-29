// Node.js script to convert images to AVIF and WebP using Sharp
// Run: node scripts/convert-images.js
// Requires: npm install sharp --save-dev

import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const publicDir = 'public';

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


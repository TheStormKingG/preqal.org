// Node.js script to convert images to WebP using Sharp
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
      { name: 'Image1-640.webp', width: 640 },
      { name: 'Image1-1200.webp', width: 1200 },
      { name: 'Image1-1920.webp', width: 1920 }
    ],
    quality: 85
  },
  {
    input: 'Preqal Logo Sep25-9.png',
    outputs: [
      { name: 'Preqal Logo Sep25-9.webp', width: null } // Keep original size
    ],
    quality: 90
  }
];

async function convertImages() {
  console.log('🖼️  Converting images to WebP...\n');

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
        
        await pipeline
          .webp({ quality: conversion.quality })
          .toFile(outputPath);
        
        console.log(`✓ Created: ${output.name}`);
      }
    } catch (error) {
      console.error(`✗ Error converting ${conversion.input}:`, error.message);
    }
  }
  
  console.log('\n✅ Image conversion complete!');
}

convertImages().catch(console.error);


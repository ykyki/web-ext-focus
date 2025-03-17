// to run this script:
// pnpm add canvas
// pnpm approve-builds
// pnpm exec node ./convert-svg-to-png.js

// after run: pnpm remove canvas

// Script to convert SVG to PNG files of different sizes
import fs from 'node:fs';
import { createCanvas, loadImage } from 'canvas';

// SVG source code from our design
const svgSource = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- Shield with gradient -->
  <defs>
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2196f3" />
      <stop offset="100%" stop-color="#0b7dda" />
    </linearGradient>
  </defs>
  
  <!-- Shield shape -->
  <path d="M64 8 C30 8 14 20 14 20 C14 20 14 58 14 78 C14 98 64 120 64 120 C64 120 114 98 114 78 C114 58 114 20 114 20 C114 20 98 8 64 8 Z" 
        fill="url(#shieldGradient)" stroke="#1565c0" stroke-width="2" />
  
  <!-- Clock face -->
  <circle cx="64" cy="64" r="40" fill="#f9f9f9" stroke="#1565c0" stroke-width="2" />
  
  <!-- Clock ticks -->
  <line x1="64" y1="30" x2="64" y2="36" stroke="#0d47a1" stroke-width="2" />
  <line x1="64" y1="92" x2="64" y2="98" stroke="#0d47a1" stroke-width="2" />
  <line x1="30" y1="64" x2="36" y2="64" stroke="#0d47a1" stroke-width="2" />
  <line x1="92" y1="64" x2="98" y2="64" stroke="#0d47a1" stroke-width="2" />
  
  <!-- Clock hands - positioned at 25 minutes (focus time) -->
  <!-- Hour hand (shorter) -->
  <line x1="64" y1="64" x2="64" y2="44" stroke="#0d47a1" stroke-width="4" stroke-linecap="round" />
  
  <!-- Minute hand (longer) - pointing to 5 (25 minutes) -->
  <line x1="64" y1="64" x2="84" y2="78" stroke="#0d47a1" stroke-width="3" stroke-linecap="round" />
  
  <!-- Center dot -->
  <circle cx="64" cy="64" r="3" fill="#0d47a1" />
</svg>
`;

// Save the SVG to a temporary file
fs.writeFileSync('temp.svg', svgSource);

// Sizes to generate
const sizes = [16, 32, 48, 96, 128];

// Convert SVG to PNG for each size
async function convertSvgToPng() {
    try {
        // Load the SVG image
        const image = await loadImage('temp.svg');

        // Create PNG for each size
        for (const size of sizes) {
            // Create canvas with the target size
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');

            // Draw the SVG on the canvas
            ctx.drawImage(image, 0, 0, size, size);

            // Convert canvas to PNG buffer
            const buffer = canvas.toBuffer('image/png');

            // Save the PNG file
            fs.writeFileSync(`public/icon/${size}.png`, buffer);

            console.log(`Created ${size}.png`);
        }

        // Clean up the temporary SVG file
        fs.unlinkSync('temp.svg');

        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error converting SVG to PNG:', error);
    }
}

// Run the conversion
convertSvgToPng();

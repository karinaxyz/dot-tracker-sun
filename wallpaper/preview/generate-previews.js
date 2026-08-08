#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const { renderWallpaper } = require('../render/render-wallpaper');

const samples = ['2026-08-08', '2026-12-31'];
const modes = ['day', 'night'];

async function main() {
  const outputDirectory = path.resolve('wallpaper/preview/output');
  await fs.mkdir(outputDirectory, { recursive: true });
  const tiles = [];

  for (let row = 0; row < samples.length; row += 1) {
    for (let column = 0; column < modes.length; column += 1) {
      const date = samples[row];
      const mode = modes[column];
      const output = path.join(outputDirectory, `${date}-${mode}.png`);
      await renderWallpaper({ date, mode, output });
      const tile = await sharp(output).resize({ width: 302 }).png().toBuffer();
      tiles.push({ input: tile, left: column * 302, top: row * 656 });
    }
  }

  const contactSheet = path.join(outputDirectory, 'living-year-contact-sheet.png');
  await sharp({
    create: {
      width: 604,
      height: samples.length * 656,
      channels: 4,
      background: '#b8b0ac',
    },
  })
    .composite(tiles)
    .png()
    .toFile(contactSheet);

  process.stdout.write(`${contactSheet}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
});

#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const WIDTH = 1206;
const HEIGHT = 2622;
const samples = ['2026-08-08', '2026-12-31'];
const modes = ['day', 'night'];

function lockScreenOverlay(date, mode) {
  const parsed = new Date(`${date}T12:00:00Z`);
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(parsed);

  const lockText = mode === 'day' ? '#451616' : '#ffffff';

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3"/>
        </filter>
      </defs>
      <g font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="${lockText}">
        <text x="603" y="208" font-size="37" font-weight="600" opacity="0.92" stroke="#000000" stroke-opacity="0.2" stroke-width="2">${dateLabel}</text>
        <text x="603" y="430" font-size="184" font-weight="500" letter-spacing="-7" stroke="#000000" stroke-opacity="0.18" stroke-width="3">9:41</text>
      </g>
      <rect x="498" y="42" width="210" height="62" rx="31" fill="#000000"/>
      <g>
        <circle cx="151" cy="2426" r="72" fill="#202020" fill-opacity="0.72" stroke="#ffffff" stroke-opacity="0.12"/>
        <circle cx="1055" cy="2426" r="72" fill="#202020" fill-opacity="0.72" stroke="#ffffff" stroke-opacity="0.12"/>
        <g transform="translate(124 2392)" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 2h18l7 28-6 23H17l-6-23z"/>
          <path d="M18 13h18M19 53v13M35 53v13"/>
        </g>
        <g transform="translate(1019 2398)" fill="none" stroke="#ffffff" stroke-width="8" stroke-linejoin="round">
          <rect x="2" y="10" width="68" height="48" rx="12"/>
          <path d="M20 10l8-10h18l8 10"/>
          <circle cx="36" cy="34" r="14"/>
        </g>
        <rect x="448" y="2565" width="310" height="13" rx="6.5" fill="#ffffff" opacity="0.9"/>
      </g>
    </svg>
  `);
}

async function main() {
  const directory = path.resolve('wallpaper/preview/output');
  await fs.mkdir(directory, { recursive: true });
  const tiles = [];

  for (let row = 0; row < samples.length; row += 1) {
    const date = samples[row];
    for (let column = 0; column < modes.length; column += 1) {
      const mode = modes[column];
      const wallpaper = path.join(directory, `${date}-${mode}.png`);
      const output = path.join(directory, `${date}-${mode}-lock-screen.png`);
      await sharp(wallpaper)
        .composite([{ input: lockScreenOverlay(date, mode), left: 0, top: 0 }])
        .png()
        .toFile(output);
      tiles.push({
        input: await sharp(output).resize({ width: 302 }).png().toBuffer(),
        left: column * 302,
        top: row * 656,
      });
    }
  }

  await sharp({
    create: { width: 604, height: 1312, channels: 4, background: '#b8b0ac' },
  })
    .composite(tiles)
    .png()
    .toFile(path.join(directory, 'lock-screen-contact-sheet.png'));
}

main().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
});

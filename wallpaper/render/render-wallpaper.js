#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const { CANVAS, LAYOUT, TYPOGRAPHY, THEMES, SUNSET_STOPS } = require('../config');
const { getDateState } = require('../calendar/date-state');
const { textPathData } = require('./text-path');

function interpolateGradient(stops, value) {
  const t = Math.max(0, Math.min(1, value));
  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let index = 0; index < stops.length - 1; index += 1) {
    if (t >= stops[index].at && t <= stops[index + 1].at) {
      lower = stops[index];
      upper = stops[index + 1];
      break;
    }
  }

  const range = upper.at - lower.at;
  const position = range === 0 ? 0 : (t - lower.at) / range;
  const smooth = position * position * (3 - 2 * position);
  return {
    r: Math.round(lower.r + (upper.r - lower.r) * smooth),
    g: Math.round(lower.g + (upper.g - lower.g) * smooth),
    b: Math.round(lower.b + (upper.b - lower.b) * smooth),
  };
}

function dotRgb(day) {
  return interpolateGradient(SUNSET_STOPS, (day - 1) / 364);
}

function dotColor(day) {
  const color = dotRgb(day);
  return `rgb(${color.r},${color.g},${color.b})`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function generateWallpaperSvg({ date, mode }) {
  if (!Object.hasOwn(THEMES, mode)) throw new Error('Mode must be day or night.');

  const state = getDateState(date);
  const theme = THEMES[mode];
  const gridWidth = (LAYOUT.columns - 1) * LAYOUT.columnGap;
  const gridLeft = LAYOUT.gridCenterX - gridWidth / 2;
  const dots = [];

  for (let day = 1; day <= 365; day += 1) {
    const column = (day - 1) % LAYOUT.columns;
    const row = Math.floor((day - 1) / LAYOUT.columns);
    const cx = gridLeft + column * LAYOUT.columnGap;
    const cy = LAYOUT.gridTopY + row * LAYOUT.rowGap;

    const isFilled = day <= state.visualDay;
    dots.push(
      `<circle class="dot ${isFilled ? 'filled' : 'future'}" data-day="${day}" cx="${cx}" cy="${cy}" r="${LAYOUT.dotRadius}" fill="${isFilled ? dotColor(day) : theme.futureDot}" opacity="${isFilled ? 0.92 : theme.futureOpacity}"/>`,
    );

    if (day === state.visualDay) {
      const assigned = dotRgb(day);
      const needsNightContrast = mode === 'night' && assigned.r + assigned.g + assigned.b < 90;
      if (needsNightContrast) {
        // Preserve the assigned gradient fill, then add a faint contrast veil so
        // late-year dots still read as solid against the near-black background.
        dots.push(
          `<circle class="today-contrast" cx="${cx}" cy="${cy}" r="${LAYOUT.dotRadius}" fill="${theme.todayRing}" opacity="0.14"/>`,
        );
      }
      // Draw the ring after the filled dot so the dot always remains visibly solid.
      dots.push(
        `<circle class="today-ring" cx="${cx}" cy="${cy}" r="${LAYOUT.todayRingRadius}" fill="none" stroke="${theme.todayRing}" stroke-opacity="${theme.todayRingOpacity}" stroke-width="3.5"/>`,
      );
    }
  }

  const percentageLabel = `${state.percentage}% through the year`;
  const yearLabel = String(state.year);
  const percentagePath = textPathData(percentageLabel, {
    centerX: LAYOUT.gridCenterX,
    baselineY: LAYOUT.metadata.percentageY,
    fontSize: TYPOGRAPHY.metadataSize,
  });
  const yearPath = textPathData(yearLabel, {
    centerX: LAYOUT.gridCenterX,
    baselineY: LAYOUT.metadata.yearY,
    fontSize: TYPOGRAPHY.yearSize,
    letterSpacing: TYPOGRAPHY.yearLetterSpacing,
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.width}" height="${CANVAS.height}" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}">`,
    `<rect width="100%" height="100%" fill="${theme.background}"/>`,
    `<g id="dot-grid">${dots.join('')}</g>`,
    `<g id="metadata" fill="${theme.text}">`,
    `<path class="percentage-label" data-label="${escapeXml(percentageLabel)}" d="${percentagePath}" opacity="0.86"/>`,
    `<path class="year-label" data-label="${yearLabel}" d="${yearPath}" opacity="0.9"/>`,
    '</g>',
    `<metadata>${escapeXml(JSON.stringify({ ...state, mode }))}</metadata>`,
    '</svg>',
  ].join('');
}

async function renderWallpaper({ date, mode, output, svgOutput }) {
  const svg = generateWallpaperSvg({ date, mode });
  await fs.mkdir(path.dirname(output), { recursive: true });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await fs.writeFile(output, png);
  if (svgOutput) {
    await fs.mkdir(path.dirname(svgOutput), { recursive: true });
    await fs.writeFile(svgOutput, svg);
  }
  return { output, svgOutput, state: getDateState(date) };
}

async function renderWallpaperBuffer({ date, mode }) {
  const svg = generateWallpaperSvg({ date, mode });
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function readArguments(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, '');
    result[key] = argv[index + 1];
  }
  return result;
}

if (require.main === module) {
  const args = readArguments(process.argv.slice(2));
  const date = args.date;
  const mode = args.mode || 'day';
  const output = path.resolve(args.output || `wallpaper-${mode}.png`);
  const svgOutput = args.svg ? path.resolve(args.svg) : undefined;

  renderWallpaper({ date, mode, output, svgOutput })
    .then(({ state }) => process.stdout.write(`${output} — day ${state.visualDay}, week ${state.week}, ${state.percentage}%\n`))
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    });
}

module.exports = {
  dotColor,
  dotRgb,
  generateWallpaperSvg,
  interpolateGradient,
  renderWallpaper,
  renderWallpaperBuffer,
};

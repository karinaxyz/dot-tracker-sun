'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const sharp = require('sharp');
const { generateWallpaperSvg, renderWallpaper } = require('../render/render-wallpaper');

test('each mode contains exactly 365 dot circles and one today ring', () => {
  for (const mode of ['day', 'night']) {
    const svg = generateWallpaperSvg({ date: '2026-08-08', mode });
    assert.equal((svg.match(/class="dot /g) || []).length, 365);
    assert.equal((svg.match(/class="today-ring"/g) || []).length, 1);
    assert.doesNotMatch(svg, /Week .* of 52/);
    assert.match(svg, /60% through the year/);
    assert.ok(svg.indexOf('60% through the year') < svg.indexOf('>2026<'));
    assert.ok(svg.indexOf('class="dot filled" data-day="220"') < svg.indexOf('class="today-ring"'));
  }
});

test('day and night use the exact tracker backgrounds', () => {
  assert.match(generateWallpaperSvg({ date: '2026-08-08', mode: 'day' }), /fill="#ffffff"/);
  assert.match(generateWallpaperSvg({ date: '2026-08-08', mode: 'night' }), /fill="#110a10"/);
});

test('December 31 stays filled beneath its current-day ring', () => {
  for (const mode of ['day', 'night']) {
    const svg = generateWallpaperSvg({ date: '2026-12-31', mode });
    assert.match(svg, /class="dot filled" data-day="365"[^>]+fill="rgb\(32,8,8\)"/);
    assert.ok(svg.indexOf('data-day="365"') < svg.lastIndexOf('class="today-ring"'));
  }
  assert.match(generateWallpaperSvg({ date: '2026-12-31', mode: 'night' }), /class="today-contrast"/);
});

test('rendered output is an iPhone 16 Pro PNG', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'living-year-'));
  const output = path.join(directory, 'wallpaper.png');
  await renderWallpaper({ date: '2026-08-08', mode: 'day', output });
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, 'png');
  assert.equal(metadata.width, 1206);
  assert.equal(metadata.height, 2622);
});

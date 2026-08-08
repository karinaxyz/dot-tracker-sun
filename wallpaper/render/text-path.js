'use strict';

const glyphs = require('./quicksand-glyphs');

function textPaths(text, { centerX, baselineY, fontSize, letterSpacing = 0 }) {
  const characters = [...String(text)];
  const scale = fontSize / 1000;
  const width = characters.reduce((total, character, index) => {
    const glyph = glyphs[character];
    if (!glyph) throw new Error(`Unsupported wallpaper label character: ${character}`);
    return total + glyph.advance * scale + (index < characters.length - 1 ? letterSpacing : 0);
  }, 0);

  let cursor = centerX - width / 2;
  return characters.map((character, index) => {
    const glyph = glyphs[character];
    const path = glyph.d
      ? `<path d="${glyph.d}" transform="translate(${cursor.toFixed(2)} ${baselineY}) scale(${scale})"/>`
      : '';
    cursor += glyph.advance * scale;
    if (index < characters.length - 1) cursor += letterSpacing;
    return path;
  }).join('');
}

module.exports = { textPaths };

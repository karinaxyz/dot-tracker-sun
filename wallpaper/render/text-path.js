'use strict';

const path = require('node:path');
const opentype = require('opentype.js');

const fontRoot = path.dirname(require.resolve('@fontsource/quicksand/package.json'));
const font = opentype.loadSync(path.join(fontRoot, 'files/quicksand-latin-400-normal.woff'));

function textPathData(text, { centerX, baselineY, fontSize, letterSpacing = 0 }) {
  const glyphs = font.stringToGlyphs(String(text));
  const scale = fontSize / font.unitsPerEm;
  let width = 0;

  for (let index = 0; index < glyphs.length; index += 1) {
    width += glyphs[index].advanceWidth * scale;
    if (index < glyphs.length - 1) {
      width += font.getKerningValue(glyphs[index], glyphs[index + 1]) * scale;
      width += letterSpacing;
    }
  }

  let cursor = centerX - width / 2;
  const combined = new opentype.Path();

  for (let index = 0; index < glyphs.length; index += 1) {
    const glyph = glyphs[index];
    combined.commands.push(...glyph.getPath(cursor, baselineY, fontSize).commands);
    cursor += glyph.advanceWidth * scale;
    if (index < glyphs.length - 1) {
      cursor += font.getKerningValue(glyph, glyphs[index + 1]) * scale;
      cursor += letterSpacing;
    }
  }

  return combined.toPathData(2);
}

module.exports = { textPathData };

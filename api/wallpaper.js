'use strict';

const { renderWallpaperBuffer } = require('../wallpaper/render/render-wallpaper');

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

module.exports = async function wallpaperEndpoint(request, response) {
  try {
    const date = firstQueryValue(request.query?.date);
    const rawMode = firstQueryValue(request.query?.mode);
    const mode = typeof rawMode === 'string' ? rawMode.trim().toLowerCase() : rawMode;
    const png = await renderWallpaperBuffer({ date, mode });

    response.statusCode = 200;
    response.setHeader('Content-Type', 'image/png');
    response.setHeader('Content-Length', String(png.length));
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=60');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.end(png);
  } catch (error) {
    response.statusCode = 400;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(JSON.stringify({
      error: error.message,
      usage: '/api/wallpaper?date=YYYY-MM-DD&mode=day|night',
    }));
  }
};

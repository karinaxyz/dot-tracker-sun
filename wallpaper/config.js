'use strict';

const CANVAS = Object.freeze({
  width: 1206,
  height: 2622,
});

const LAYOUT = Object.freeze({
  columns: 19,
  rows: 20,
  dotRadius: 17,
  todayRingRadius: 20.5,
  columnGap: 45,
  rowGap: 51,
  gridCenterX: 603,
  gridTopY: 916.5,
  metadata: Object.freeze({
    percentageY: 1998,
    yearY: 2068,
  }),
});

const TYPOGRAPHY = Object.freeze({
  // Replace this value when a licensed brand font is available to the renderer.
  family: 'Arial, Helvetica, sans-serif',
  metadataSize: 34,
  yearSize: 34,
  metadataWeight: 400,
  yearWeight: 400,
  yearLetterSpacing: 5,
});

const THEMES = Object.freeze({
  day: Object.freeze({
    background: '#ffffff',
    text: '#451616',
    futureDot: '#e5e2e0',
    futureOpacity: 0.52,
    todayRing: '#451616',
    todayRingOpacity: 0.68,
  }),
  night: Object.freeze({
    background: '#110a10',
    text: '#dbbddc',
    futureDot: '#6f5568',
    futureOpacity: 0.48,
    todayRing: '#dbbddc',
    todayRingOpacity: 0.72,
  }),
});

const SUNSET_STOPS = Object.freeze([
  { at: 0.00, r: 120, g: 130, b: 180 },
  { at: 0.15, r: 140, g: 120, b: 180 },
  { at: 0.28, r: 175, g: 140, b: 180 },
  { at: 0.40, r: 200, g: 120, b: 145 },
  { at: 0.52, r: 220, g: 95, b: 72 },
  { at: 0.62, r: 210, g: 145, b: 60 },
  { at: 0.72, r: 205, g: 110, b: 65 },
  { at: 0.82, r: 140, g: 50, b: 50 },
  { at: 0.90, r: 69, g: 22, b: 22 },
  { at: 1.00, r: 32, g: 8, b: 8 },
]);

module.exports = { CANVAS, LAYOUT, TYPOGRAPHY, THEMES, SUNSET_STOPS };

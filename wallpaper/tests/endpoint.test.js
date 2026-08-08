'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const sharp = require('sharp');
const endpoint = require('../../api/wallpaper');

function invoke(query) {
  return new Promise((resolve, reject) => {
    const headers = {};
    const response = {
      statusCode: 200,
      setHeader(name, value) {
        headers[name.toLowerCase()] = String(value);
      },
      end(body) {
        resolve({ statusCode: this.statusCode, headers, body });
      },
    };
    Promise.resolve(endpoint({ query }, response)).catch(reject);
  });
}

for (const mode of ['day', 'night']) {
  test(`endpoint returns a native PNG for ${mode} mode`, async () => {
    const result = await invoke({ date: '2026-08-08', mode });
    assert.equal(result.statusCode, 200);
    assert.equal(result.headers['content-type'], 'image/png');
    assert.equal(result.headers['x-content-type-options'], 'nosniff');
    assert.equal(result.headers['cache-control'], 'public, max-age=0, s-maxage=86400, stale-while-revalidate=60');
    assert.ok(Buffer.isBuffer(result.body));
    assert.equal(result.body.subarray(1, 4).toString(), 'PNG');
    const metadata = await sharp(result.body).metadata();
    assert.equal(metadata.width, 1206);
    assert.equal(metadata.height, 2622);
  });
}

test('endpoint rejects invalid dates and modes without returning HTML', async () => {
  for (const query of [
    { date: '2026-02-29', mode: 'day' },
    { date: '2026-08-08', mode: 'sunset' },
    { mode: 'day' },
  ]) {
    const result = await invoke(query);
    assert.equal(result.statusCode, 400);
    assert.equal(result.headers['content-type'], 'application/json; charset=utf-8');
  }
});

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { getDateState, visualDayOfYear } = require('../calendar/date-state');

test('normal-year dates map directly to dots 1 through 365', () => {
  assert.equal(visualDayOfYear('2026-01-01'), 1);
  assert.equal(visualDayOfYear('2026-02-28'), 59);
  assert.equal(visualDayOfYear('2026-03-01'), 60);
  assert.equal(visualDayOfYear('2026-12-31'), 365);
});

test('February 28 and 29 share dot 59 in a leap year', () => {
  assert.equal(visualDayOfYear('2028-02-28'), 59);
  assert.equal(visualDayOfYear('2028-02-29'), 59);
  assert.equal(visualDayOfYear('2028-03-01'), 60);
  assert.equal(visualDayOfYear('2028-12-31'), 365);
});

test('week and percentage are visual-year progress values', () => {
  assert.deepEqual(getDateState('2026-01-01'), {
    date: '2026-01-01', year: 2026, visualDay: 1, week: 1, percentage: 0,
  });
  assert.equal(getDateState('2026-12-31').week, 52);
  assert.equal(getDateState('2026-12-31').percentage, 100);
});

test('invalid or ambiguous dates are rejected', () => {
  assert.throws(() => visualDayOfYear('2026-02-29'), /Invalid calendar date/);
  assert.throws(() => visualDayOfYear('08-08-2026'), /YYYY-MM-DD/);
});

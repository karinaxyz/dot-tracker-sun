'use strict';

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function parseLocalCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) throw new Error('Date must use YYYY-MM-DD.');

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const verified = new Date(Date.UTC(year, month - 1, day));

  if (
    year < 1 ||
    verified.getUTCFullYear() !== year ||
    verified.getUTCMonth() !== month - 1 ||
    verified.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${value}`);
  }

  return { year, month, day };
}

function visualDayOfYear(value) {
  const { year, month, day } = parseLocalCalendarDate(value);
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  let visualDay = Math.floor((current - start) / 86400000) + 1;

  // A leap year's February 28 and 29 share dot 59. March 1 remains dot 60.
  if (isLeapYear(year) && (month > 2 || (month === 2 && day === 29))) {
    visualDay -= 1;
  }

  return visualDay;
}

function getDateState(value) {
  const { year } = parseLocalCalendarDate(value);
  const visualDay = visualDayOfYear(value);
  return {
    date: value,
    year,
    visualDay,
    week: Math.min(52, Math.ceil(visualDay / 7)),
    percentage: Math.round((visualDay / 365) * 100),
  };
}

module.exports = { getDateState, isLeapYear, parseLocalCalendarDate, visualDayOfYear };

// Created by Andy
// Unit tests for UTHG 2026 Race Day app

/**
 * @jest-environment jsdom
 */

// Mock ROUTES before requiring app
global.ROUTES = {
  '70k': { id: '70k', raceDate: '2026-04-04T04:00:00+07:00', cutoffDate: '2026-04-05T04:00:00+07:00' },
  '55k': { id: '55k', raceDate: '2026-04-04T05:00:00+07:00', cutoffDate: '2026-04-05T01:00:00+07:00' },
};

const { computeCountdown, computeElapsed, getRouteFromHash } = require('./app');

// ─── computeCountdown ───────────────────────────────────────

describe('computeCountdown', () => {
  const race = new Date('2026-04-04T04:00:00+07:00');

  test('returns correct days/hours/mins/secs when race is in the future', () => {
    const now = new Date('2026-03-21T10:00:00+07:00');
    const cd = computeCountdown(now, race);
    expect(cd.done).toBe(false);
    expect(cd.days).toBe(13);
    expect(cd.hours).toBe(18);
    expect(cd.mins).toBe(0);
    expect(cd.secs).toBe(0);
  });

  test('returns done=true when race time has passed', () => {
    const now = new Date('2026-04-04T05:00:00+07:00');
    expect(computeCountdown(now, race).done).toBe(true);
  });

  test('returns done=true when now equals race time exactly', () => {
    const now = new Date('2026-04-04T04:00:00+07:00');
    expect(computeCountdown(now, race).done).toBe(true);
  });

  test('returns 0 days when less than 24h remain', () => {
    const now = new Date('2026-04-03T10:00:00+07:00');
    const cd = computeCountdown(now, race);
    expect(cd.days).toBe(0);
    expect(cd.hours).toBe(18);
  });

  test('handles large time differences correctly', () => {
    const now = new Date('2026-01-01T00:00:00+07:00');
    expect(computeCountdown(now, race).days).toBe(93);
  });
});

// ─── computeElapsed ─────────────────────────────────────────

describe('computeElapsed', () => {
  const race = new Date('2026-04-04T04:00:00+07:00');
  const cutoff = new Date('2026-04-05T04:00:00+07:00');

  test('returns null before race starts', () => {
    expect(computeElapsed(new Date('2026-04-03T23:00:00+07:00'), race, cutoff)).toBeNull();
  });

  test('returns elapsed time during race', () => {
    const el = computeElapsed(new Date('2026-04-04T14:30:00+07:00'), race, cutoff);
    expect(el.hours).toBe(10);
    expect(el.mins).toBe(30);
    expect(el.secs).toBe(0);
  });

  test('returns elapsed time at race start', () => {
    const el = computeElapsed(new Date('2026-04-04T04:00:01+07:00'), race, cutoff);
    expect(el.hours).toBe(0);
    expect(el.mins).toBe(0);
    expect(el.secs).toBe(1);
  });

  test('returns null after cutoff', () => {
    expect(computeElapsed(new Date('2026-04-05T05:00:00+07:00'), race, cutoff)).toBeNull();
  });

  test('returns elapsed just before cutoff', () => {
    const el = computeElapsed(new Date('2026-04-05T03:59:59+07:00'), race, cutoff);
    expect(el.hours).toBe(23);
    expect(el.mins).toBe(59);
    expect(el.secs).toBe(59);
  });
});

// ─── computeElapsed for 55K ─────────────────────────────────

describe('computeElapsed for 55K (different start/cutoff)', () => {
  const race55 = new Date('2026-04-04T05:00:00+07:00');
  const cutoff55 = new Date('2026-04-05T01:00:00+07:00');

  test('returns null at 70K start time (before 55K start)', () => {
    expect(computeElapsed(new Date('2026-04-04T04:30:00+07:00'), race55, cutoff55)).toBeNull();
  });

  test('returns elapsed during 55K race', () => {
    const el = computeElapsed(new Date('2026-04-04T15:00:00+07:00'), race55, cutoff55);
    expect(el.hours).toBe(10);
    expect(el.mins).toBe(0);
  });

  test('returns null after 55K cutoff (01:00 next day)', () => {
    expect(computeElapsed(new Date('2026-04-05T02:00:00+07:00'), race55, cutoff55)).toBeNull();
  });
});

// ─── getRouteFromHash ───────────────────────────────────────

describe('getRouteFromHash', () => {
  test('returns 70k as default when no hash', () => {
    location.hash = '';
    expect(getRouteFromHash()).toBe('70k');
  });

  test('returns 70k for #70k hash', () => {
    location.hash = '#70k';
    expect(getRouteFromHash()).toBe('70k');
  });

  test('returns 55k for #55k hash', () => {
    location.hash = '#55k';
    expect(getRouteFromHash()).toBe('55k');
  });

  test('returns 70k for invalid hash', () => {
    location.hash = '#100k';
    expect(getRouteFromHash()).toBe('70k');
  });
});

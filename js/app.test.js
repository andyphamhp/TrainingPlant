// Created by Andy
// Unit tests for UTHG 2026 Trail 70K Race Day app

/**
 * @jest-environment jsdom
 */

const {
  computeCountdown, computeElapsed, RACE_DATE, CUTOFF_DATE
} = require('./app');

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
    const cd = computeCountdown(now, race);
    expect(cd.done).toBe(true);
  });

  test('returns done=true when now equals race time exactly', () => {
    const now = new Date('2026-04-04T04:00:00+07:00');
    const cd = computeCountdown(now, race);
    expect(cd.done).toBe(true);
  });

  test('returns 0 days when less than 24h remain', () => {
    const now = new Date('2026-04-03T10:00:00+07:00');
    const cd = computeCountdown(now, race);
    expect(cd.done).toBe(false);
    expect(cd.days).toBe(0);
    expect(cd.hours).toBe(18);
  });

  test('handles large time differences correctly', () => {
    const now = new Date('2026-01-01T00:00:00+07:00');
    const cd = computeCountdown(now, race);
    expect(cd.done).toBe(false);
    expect(cd.days).toBe(93);
  });
});

// ─── computeElapsed ─────────────────────────────────────────

describe('computeElapsed', () => {
  const race = new Date('2026-04-04T04:00:00+07:00');
  const cutoff = new Date('2026-04-05T04:00:00+07:00');

  test('returns null before race starts', () => {
    const now = new Date('2026-04-03T23:00:00+07:00');
    expect(computeElapsed(now, race, cutoff)).toBeNull();
  });

  test('returns elapsed time during race', () => {
    const now = new Date('2026-04-04T14:30:00+07:00'); // 10h30m into race
    const el = computeElapsed(now, race, cutoff);
    expect(el).not.toBeNull();
    expect(el.hours).toBe(10);
    expect(el.mins).toBe(30);
    expect(el.secs).toBe(0);
  });

  test('returns elapsed time at race start', () => {
    const now = new Date('2026-04-04T04:00:01+07:00'); // 1 second in
    const el = computeElapsed(now, race, cutoff);
    expect(el).not.toBeNull();
    expect(el.hours).toBe(0);
    expect(el.mins).toBe(0);
    expect(el.secs).toBe(1);
  });

  test('returns null after cutoff', () => {
    const now = new Date('2026-04-05T05:00:00+07:00');
    expect(computeElapsed(now, race, cutoff)).toBeNull();
  });

  test('returns elapsed just before cutoff', () => {
    const now = new Date('2026-04-05T03:59:59+07:00');
    const el = computeElapsed(now, race, cutoff);
    expect(el).not.toBeNull();
    expect(el.hours).toBe(23);
    expect(el.mins).toBe(59);
    expect(el.secs).toBe(59);
  });

  test('totalMs and cutoffMs are correct', () => {
    const now = new Date('2026-04-04T05:00:00+07:00'); // 1h into race
    const el = computeElapsed(now, race, cutoff);
    expect(el.totalMs).toBe(3600000);
    expect(el.cutoffMs).toBe(86400000); // 24h
  });
});

// ─── Constants ──────────────────────────────────────────────

describe('constants', () => {
  test('RACE_DATE is April 4, 2026 at 04:00 UTC+7', () => {
    expect(RACE_DATE).toBe('2026-04-04T04:00:00+07:00');
  });

  test('CUTOFF_DATE is April 5, 2026 at 04:00 UTC+7 (24h)', () => {
    expect(CUTOFF_DATE).toBe('2026-04-05T04:00:00+07:00');
  });
});

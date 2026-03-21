// Created by Andy
// Unit tests for Training Plant app

/**
 * @jest-environment jsdom
 */

const { computeCountdown, getTodayDateString, highlightToday, toggleDetail } = require('./app');

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

// ─── getTodayDateString ─────────────────────────────────────

describe('getTodayDateString', () => {
  test('formats 21/3/2026 as 2026-03-21', () => {
    const date = new Date(2026, 2, 21); // month is 0-indexed
    expect(getTodayDateString(date)).toBe('2026-03-21');
  });

  test('pads single-digit month and day', () => {
    const date = new Date(2026, 0, 5); // Jan 5
    expect(getTodayDateString(date)).toBe('2026-01-05');
  });

  test('handles month boundary (April)', () => {
    const date = new Date(2026, 3, 4); // Apr 4
    expect(getTodayDateString(date)).toBe('2026-04-04');
  });

  test('handles Dec 31', () => {
    const date = new Date(2026, 11, 31);
    expect(getTodayDateString(date)).toBe('2026-12-31');
  });
});

// ─── highlightToday ─────────────────────────────────────────

describe('highlightToday', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="day" data-date="2026-03-20">
        <div class="day-header">
          <span class="day-name">FRI 20/3 · D1</span>
          <span class="day-type type-climb">CLIMB</span>
        </div>
        <div class="day-body"></div>
      </div>
      <div class="day" data-date="2026-03-21">
        <div class="day-header">
          <span class="day-name">SAT 21/3 · D2</span>
          <span class="day-type type-strength">STRENGTH</span>
        </div>
        <div class="day-body"></div>
      </div>
      <div class="day" data-date="2026-03-22">
        <div class="day-header">
          <span class="day-name">SUN 22/3 · D3</span>
          <span class="day-type type-combo">COMBO</span>
        </div>
        <div class="day-body"></div>
      </div>
    `;
  });

  test('adds is-today class and TODAY badge to matching date card', () => {
    highlightToday(new Date(2026, 2, 21)); // March 21

    const cards = document.querySelectorAll('.day');
    expect(cards[0].classList.contains('is-today')).toBe(false);
    expect(cards[1].classList.contains('is-today')).toBe(true);
    expect(cards[2].classList.contains('is-today')).toBe(false);

    const badge = cards[1].querySelector('.today-badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe('TODAY');
  });

  test('does not add badge to non-matching cards', () => {
    highlightToday(new Date(2026, 2, 21));

    expect(document.querySelectorAll('.today-badge').length).toBe(1);
  });

  test('no card highlighted when date matches none', () => {
    highlightToday(new Date(2026, 5, 15)); // June 15

    const cards = document.querySelectorAll('.day');
    cards.forEach(card => {
      expect(card.classList.contains('is-today')).toBe(false);
    });
    expect(document.querySelectorAll('.today-badge').length).toBe(0);
  });

  test('moves highlight when called with a different date', () => {
    highlightToday(new Date(2026, 2, 20)); // March 20
    const cards = document.querySelectorAll('.day');
    expect(cards[0].classList.contains('is-today')).toBe(true);
    expect(cards[1].classList.contains('is-today')).toBe(false);

    highlightToday(new Date(2026, 2, 21)); // March 21
    expect(cards[0].classList.contains('is-today')).toBe(false);
    expect(cards[1].classList.contains('is-today')).toBe(true);

    // Old badge removed, new one added
    expect(cards[0].querySelector('.today-badge')).toBeNull();
    expect(cards[1].querySelector('.today-badge')).not.toBeNull();
  });

  test('does not duplicate badge on repeated calls for same date', () => {
    highlightToday(new Date(2026, 2, 21));
    highlightToday(new Date(2026, 2, 21));
    highlightToday(new Date(2026, 2, 21));

    expect(document.querySelectorAll('.today-badge').length).toBe(1);
  });
});

// ─── toggleDetail ───────────────────────────────────────────

describe('toggleDetail', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="day">
        <div class="day-body">
          <button class="detail-toggle"><i class="arrow">▼</i> SHOW DETAIL</button>
        </div>
        <div class="detail-panel">
          <div class="detail-inner">Content here</div>
        </div>
      </div>
    `;
  });

  test('opens panel on first click', () => {
    const btn = document.querySelector('.detail-toggle');
    toggleDetail(btn);

    const panel = document.querySelector('.detail-panel');
    expect(panel.classList.contains('open')).toBe(true);
    expect(btn.classList.contains('open')).toBe(true);
    expect(btn.textContent).toContain('HIDE DETAIL');
  });

  test('closes panel on second click', () => {
    const btn = document.querySelector('.detail-toggle');
    toggleDetail(btn); // open
    toggleDetail(btn); // close

    const panel = document.querySelector('.detail-panel');
    expect(panel.classList.contains('open')).toBe(false);
    expect(btn.classList.contains('open')).toBe(false);
    expect(btn.textContent).toContain('SHOW DETAIL');
  });

  test('toggle cycle works correctly across multiple clicks', () => {
    const btn = document.querySelector('.detail-toggle');
    const panel = document.querySelector('.detail-panel');

    for (let i = 0; i < 5; i++) {
      toggleDetail(btn);
      expect(panel.classList.contains('open')).toBe(true);
      toggleDetail(btn);
      expect(panel.classList.contains('open')).toBe(false);
    }
  });
});

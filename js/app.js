// Created by Andy
// UTHG 2026 — Trail 70K Race Day

const RACE_DATE = '2026-04-04T04:00:00+07:00';
const CUTOFF_DATE = '2026-04-05T04:00:00+07:00';

// Countdown to race day: 4/4/2026 04:00 AM (UTC+7)
function computeCountdown(now, raceDate) {
  const diff = raceDate - now;
  if (diff <= 0) {
    return { done: true, days: 0, hours: 0, mins: 0, secs: 0 };
  }
  return {
    done: false,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

// Elapsed time since race start (for race day mode)
function computeElapsed(now, raceDate, cutoffDate) {
  const elapsed = now - raceDate;
  const cutoff = cutoffDate - raceDate;
  if (elapsed < 0 || elapsed > cutoff) {
    return null;
  }
  return {
    hours: Math.floor(elapsed / 3600000),
    mins: Math.floor((elapsed % 3600000) / 60000),
    secs: Math.floor((elapsed % 60000) / 1000),
    totalMs: elapsed,
    cutoffMs: cutoff,
  };
}

function renderCountdown(cd) {
  if (cd.done) {
    document.getElementById('cd-days').textContent = '🏔️';
    ['cd-hours', 'cd-mins', 'cd-secs'].forEach(id => {
      document.getElementById(id).textContent = '00';
    });
    return;
  }
  document.getElementById('cd-days').textContent = String(cd.days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(cd.hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(cd.mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(cd.secs).padStart(2, '0');
}

function renderElapsed(el) {
  const section = document.getElementById('countdown-section');
  if (!section) return;

  // Switch labels to elapsed mode
  const labels = section.querySelectorAll('.cd-label');
  if (labels.length >= 4) {
    labels[0].textContent = 'Race';
    labels[1].textContent = 'Hours';
    labels[2].textContent = 'Mins';
    labels[3].textContent = 'Secs';
  }

  document.getElementById('cd-days').textContent = '🏃';
  document.getElementById('cd-hours').textContent = String(el.hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(el.mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(el.secs).padStart(2, '0');
}

function updateCountdown() {
  const now = new Date();
  const raceDate = new Date(RACE_DATE);
  const cutoffDate = new Date(CUTOFF_DATE);

  // Check if race is in progress
  const elapsed = computeElapsed(now, raceDate, cutoffDate);
  if (elapsed) {
    renderElapsed(elapsed);
    return;
  }

  // Pre-race countdown
  const cd = computeCountdown(now, raceDate);
  renderCountdown(cd);
}

// Init
if (typeof document !== 'undefined' && document.getElementById('cd-days')) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    computeCountdown, computeElapsed, renderCountdown, renderElapsed,
    updateCountdown, RACE_DATE, CUTOFF_DATE
  };
}

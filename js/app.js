// Created by Andy
// 5000m Gain — Ultra Trail Training Plan

const RACE_DATE = '2026-04-04T04:00:00+07:00';

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

function renderCountdown(cd) {
  if (cd.done) {
    document.getElementById('cd-days').textContent = '🏆';
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

function updateCountdown() {
  const cd = computeCountdown(new Date(), new Date(RACE_DATE));
  renderCountdown(cd);
}

// Highlight today's card dynamically based on data-date attributes
function getTodayDateString(now) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function highlightToday(now) {
  const todayStr = getTodayDateString(now);
  document.querySelectorAll('.day[data-date]').forEach(card => {
    const isToday = card.dataset.date === todayStr;
    card.classList.toggle('is-today', isToday);
    const header = card.querySelector('.day-header');
    const existingBadge = header.querySelector('.today-badge');
    if (isToday && !existingBadge) {
      const badge = document.createElement('span');
      badge.className = 'today-badge';
      badge.textContent = 'TODAY';
      header.appendChild(badge);
    } else if (!isToday && existingBadge) {
      existingBadge.remove();
    }
  });
}

// Toggle detail panels
function toggleDetail(btn) {
  const panel = btn.closest('.day-body').nextElementSibling;
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.innerHTML = isOpen
    ? '<i class="arrow">▼</i> SHOW DETAIL'
    : '<i class="arrow">▼</i> HIDE DETAIL';
}

// Init
if (typeof document !== 'undefined' && document.getElementById('cd-days')) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  highlightToday(new Date());
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeCountdown, getTodayDateString, highlightToday, toggleDetail, RACE_DATE };
}

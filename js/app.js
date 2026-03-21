// Created by Andy
// 5000m Gain — Ultra Trail Training Plan

const RACE_DATE = '2026-04-04T04:00:00+07:00';
const STORAGE_KEY = 'training-plant-completed';

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

// Workout completion with localStorage
function getCompletedWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCompletedWorkout(date, timestamp) {
  const completed = getCompletedWorkouts();
  completed[date] = timestamp;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
}

function removeCompletedWorkout(date) {
  const completed = getCompletedWorkouts();
  delete completed[date];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
}

function markCardDone(card, timestamp) {
  const date = card.dataset.date;
  card.classList.add('is-done');

  const header = card.querySelector('.day-header');
  if (!header.querySelector('.done-badge')) {
    const badge = document.createElement('span');
    badge.className = 'done-badge';
    badge.textContent = 'DONE';
    header.appendChild(badge);
  }

  const body = card.querySelector('.day-body');
  const existingTime = body.querySelector('.done-time');
  if (!existingTime) {
    const timeEl = document.createElement('div');
    timeEl.className = 'done-time';
    const d = new Date(timestamp);
    timeEl.textContent = 'Completed ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    body.appendChild(timeEl);
  }
}

function unmarkCardDone(card) {
  card.classList.remove('is-done');
  const badge = card.querySelector('.done-badge');
  if (badge) badge.remove();
  const timeEl = card.querySelector('.done-time');
  if (timeEl) timeEl.remove();
}

function completeWorkout(btn) {
  const card = btn.closest('.day');
  const date = card.dataset.date;
  const timestamp = new Date().toISOString();
  saveCompletedWorkout(date, timestamp);
  markCardDone(card, timestamp);
}

function undoComplete(card) {
  const date = card.dataset.date;
  removeCompletedWorkout(date);
  unmarkCardDone(card);
}

function initCompleteButtons() {
  const completed = getCompletedWorkouts();

  document.querySelectorAll('.day[data-date]').forEach(card => {
    const date = card.dataset.date;
    const body = card.querySelector('.day-body');

    // Restore completed state from localStorage
    if (completed[date] && !card.classList.contains('is-done')) {
      markCardDone(card, completed[date]);
    }

    // Add complete button if not already done via HTML (D1 has hardcoded actual-vs-plan)
    if (!body.querySelector('.complete-btn')) {
      const btn = document.createElement('button');
      btn.className = 'complete-btn';
      btn.innerHTML = '✓ MARK COMPLETE';
      btn.addEventListener('click', function () { completeWorkout(this); });
      body.appendChild(btn);
    }

    // Add undo on done-badge click
    const doneBadge = card.querySelector('.done-badge');
    if (doneBadge) {
      doneBadge.style.cursor = 'pointer';
      doneBadge.title = 'Click to undo';
      doneBadge.addEventListener('click', function () {
        if (confirm('Undo completion for this workout?')) {
          undoComplete(card);
        }
      });
    }
  });
}

// Init
if (typeof document !== 'undefined' && document.getElementById('cd-days')) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  highlightToday(new Date());
  initCompleteButtons();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    computeCountdown, getTodayDateString, highlightToday, toggleDetail,
    getCompletedWorkouts, saveCompletedWorkout, removeCompletedWorkout,
    markCardDone, unmarkCardDone, completeWorkout, initCompleteButtons,
    RACE_DATE, STORAGE_KEY
  };
}

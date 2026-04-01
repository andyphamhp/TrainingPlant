// Created by Andy
// UTHG 2026 — Race Day Companion

var activeRoute = null;

function getRouteFromHash() {
  if (typeof location !== 'undefined') {
    var hash = location.hash.replace('#', '').toLowerCase();
    if (typeof ROUTES !== 'undefined' && ROUTES[hash]) return hash;
  }
  return '70k';
}

// Countdown to race start
function computeCountdown(now, raceDate) {
  var diff = raceDate - now;
  if (diff <= 0) return { done: true, days: 0, hours: 0, mins: 0, secs: 0 };
  return {
    done: false,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

// Elapsed time since race start
function computeElapsed(now, raceDate, cutoffDate) {
  var elapsed = now - raceDate;
  var cutoff = cutoffDate - raceDate;
  if (elapsed < 0 || elapsed > cutoff) return null;
  return {
    hours: Math.floor(elapsed / 3600000),
    mins: Math.floor((elapsed % 3600000) / 60000),
    secs: Math.floor((elapsed % 60000) / 1000),
  };
}

function renderCountdown() {
  if (!activeRoute) return;
  var now = new Date();
  var race = new Date(activeRoute.raceDate);
  var cutoff = new Date(activeRoute.cutoffDate);
  var section = document.getElementById('countdown-section');
  if (!section) return;

  var labels = section.querySelectorAll('.cd-label');
  var el = computeElapsed(now, race, cutoff);
  if (el) {
    if (labels.length >= 4) { labels[0].textContent = 'Race'; labels[1].textContent = 'Hours'; labels[2].textContent = 'Mins'; labels[3].textContent = 'Secs'; }
    document.getElementById('cd-days').textContent = '🏃';
    document.getElementById('cd-hours').textContent = String(el.hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(el.mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(el.secs).padStart(2, '0');
    return;
  }

  if (labels.length >= 4) { labels[0].textContent = 'Days'; labels[1].textContent = 'Hours'; labels[2].textContent = 'Mins'; labels[3].textContent = 'Secs'; }
  var cd = computeCountdown(now, race);
  if (cd.done) {
    document.getElementById('cd-days').textContent = '🏔️';
    ['cd-hours', 'cd-mins', 'cd-secs'].forEach(function(id) { document.getElementById(id).textContent = '00'; });
  } else {
    document.getElementById('cd-days').textContent = String(cd.days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(cd.hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(cd.mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(cd.secs).padStart(2, '0');
  }
}

// ─── Render Functions ───────────────────────────────────────

function renderHeader() {
  var r = activeRoute;
  document.getElementById('route-eyebrow').textContent = r.eyebrow;
  var hero = document.getElementById('route-hero');
  hero.innerHTML = r.heroStat + '<span>Elevation Gain</span>';
  document.getElementById('route-tagline').textContent = r.tagline;
}

function renderStats() {
  var html = '';
  activeRoute.stats.forEach(function(s) {
    html += '<div class="stat"><div class="stat-val">' + s.val + '</div><div class="stat-label">' + s.label + '</div></div>';
  });
  document.getElementById('stats-bar').innerHTML = html;
}

function renderCourseStats() {
  var c = activeRoute.course;
  var fields = [
    { val: c.km, label: 'km' }, { val: c.dPlus, label: 'm D+' }, { val: c.dMinus, label: 'm D-' },
    { val: c.maxElev, label: 'max elev' }, { val: c.minElev, label: 'min elev' }, { val: c.startElev, label: 'start elev' },
  ];
  var html = '';
  fields.forEach(function(f) {
    html += '<div class="course-stat"><div class="course-stat-val">' + f.val + '</div><div class="course-stat-label">' + f.label + '</div></div>';
  });
  document.getElementById('course-stats').innerHTML = html;
  document.getElementById('course-sub').textContent = '// FINAL GPX · ' + c.km + 'km loop · Start/Finish SVĐ Mèo Vạc //';
}

function renderElevationSVG() {
  var e = activeRoute.elevation;
  var cps = activeRoute.checkpoints;
  var svg = '';

  // Grid lines
  var grids = [{ ele: 500, y: 153.5 }, { ele: 750, y: 117.6 }, { ele: 1000, y: 81.7 }, { ele: 1250, y: 45.9 }];
  grids.forEach(function(g) {
    svg += '<line x1="40" y1="' + g.y + '" x2="870" y2="' + g.y + '" stroke="#3a3028" stroke-width="0.5"/>';
    svg += '<text x="36" y="' + g.y + '" text-anchor="end" dominant-baseline="middle" fill="#6b5d4f" font-size="8" font-family="DM Mono,monospace">' + g.ele + 'm</text>';
  });

  // Origin line
  svg += '<line x1="40" y1="10" x2="40" y2="175" stroke="#3a3028" stroke-width="0.5" stroke-dasharray="2,4"/>';
  svg += '<text x="40" y="190" text-anchor="middle" fill="#6b5d4f" font-size="7" font-family="DM Mono,monospace">0</text>';

  // Checkpoint lines
  cps.forEach(function(cp) {
    svg += '<line x1="' + cp.x + '" y1="10" x2="' + cp.x + '" y2="175" stroke="' + cp.color + '" stroke-width="0.5" stroke-dasharray="2,4"/>';
    svg += '<text x="' + cp.x + '" y="190" text-anchor="middle" fill="' + cp.color + '" font-size="7" font-family="DM Mono,monospace">' + cp.name + '</text>';
    svg += '<text x="' + cp.x + '" y="197" text-anchor="middle" fill="#6b5d4f" font-size="6" font-family="DM Mono,monospace">' + cp.km + '</text>';
  });

  // Climb zones
  activeRoute.climbZones.forEach(function(z) {
    svg += '<rect x="' + z.x + '" y="10" width="' + z.w + '" height="165" fill="#E8A03012"/>';
  });
  // Descent zones
  activeRoute.descentZones.forEach(function(z) {
    svg += '<rect x="' + z.x + '" y="10" width="' + z.w + '" height="165" fill="#C0392B12"/>';
  });

  // Elevation fill + line
  svg += '<polygon points="' + e.polygon + '" fill="url(#elevGrad)" opacity="0.6"/>';
  svg += '<polyline points="' + e.polyline + '" fill="none" stroke="#E8A030" stroke-width="1.5" stroke-linejoin="round"/>';

  // Markers
  svg += '<circle cx="' + e.startX + '" cy="' + e.startY + '" r="3" fill="#7ab372"/>';
  svg += '<text x="' + (e.startX + 6) + '" y="' + (e.startY - 6) + '" fill="#7ab372" font-size="8" font-family="DM Mono,monospace">START ' + e.startElev + 'm</text>';
  svg += '<circle cx="' + e.finishX + '" cy="' + e.finishY + '" r="3" fill="#E8A030"/>';
  svg += '<text x="' + (e.finishX - 6) + '" y="' + (e.finishY - 6) + '" fill="#E8A030" font-size="8" font-family="DM Mono,monospace" text-anchor="end">FINISH ' + e.finishElev + 'm</text>';
  svg += '<circle cx="' + e.highX + '" cy="' + e.highY + '" r="2.5" fill="#E8A030"/>';
  svg += '<text x="' + (e.highX - 16) + '" y="' + (e.highY - 4) + '" fill="#E8A030" font-size="7" font-family="DM Mono,monospace">' + e.highElev + 'm</text>';
  svg += '<circle cx="' + e.lowX + '" cy="' + e.lowY + '" r="2.5" fill="#7BB3C4"/>';
  svg += '<text x="' + (e.lowX + 5) + '" y="' + (e.lowY + 10) + '" fill="#7BB3C4" font-size="7" font-family="DM Mono,monospace">' + e.lowElev + 'm</text>';

  // Parse SVG content via a temp container to get proper SVG namespace nodes
  var svgEl = document.getElementById('elevation-svg');
  // Keep the <defs> element, remove everything else
  var defs = svgEl.querySelector('defs');
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
  if (defs) svgEl.appendChild(defs);
  // Parse new SVG content
  var tmp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  tmp.innerHTML = svg;
  while (tmp.firstChild) svgEl.appendChild(tmp.firstChild);
}

function renderSegments() {
  var html = '';
  activeRoute.segments.forEach(function(s) {
    html += '<tr><td><b>' + s.from + ' → ' + s.to + '</b></td><td>' + s.dist + '</td><td><b>' + s.dPlus + '</b></td><td>' + s.dMinus + '</td><td>' + s.range + '</td><td>' + s.strategy + '</td></tr>';
  });
  document.getElementById('segments-tbody').innerHTML = html;
}

function renderDangerZones() {
  var html = '<div><div class="danger-col-title climb">Steepest Climbs</div>';
  activeRoute.dangerClimbs.forEach(function(d) {
    html += '<div class="danger-item"><div class="danger-km">' + d.segment + '</div><div class="danger-stats climb">' + d.stats + '</div><div class="danger-note">' + d.note + '</div></div>';
  });
  html += '</div><div><div class="danger-col-title descent">Steepest Descents</div>';
  activeRoute.dangerDescents.forEach(function(d) {
    html += '<div class="danger-item"><div class="danger-km">' + d.segment + '</div><div class="danger-stats descent">' + d.stats + '</div><div class="danger-note">' + d.note + '</div></div>';
  });
  html += '</div>';
  document.getElementById('danger-grid').innerHTML = html;
}

function renderCutoffs() {
  var html = '';
  activeRoute.cutoffs.forEach(function(c) {
    html += '<tr><td><b>' + c.cp + '</b></td><td>' + c.km + '</td><td>' + c.cutoff + '</td><td>' + c.target + '</td><td>' + c.buffer + '</td><td>' + c.notes + '</td></tr>';
  });
  document.getElementById('cutoffs-tbody').innerHTML = html;
}

function renderStrategy() {
  var html = '';
  activeRoute.blocks.forEach(function(b) {
    html += '<div class="strategy-card ' + b.css + '">';
    html += '<div class="strategy-badge">BLOCK ' + b.num + '</div>';
    html += '<div class="strategy-title">' + b.title + '</div>';
    html += '<div class="strategy-meta">' + b.meta + '</div>';
    html += '<div class="strategy-desc">' + b.desc + '</div>';
    html += '<div class="strategy-tip">' + b.tip + '</div>';
    html += '</div>';
  });
  document.getElementById('strategy-grid').innerHTML = html;
  document.getElementById('night-plan').innerHTML = activeRoute.nightPlan;
}

function renderAmenities() {
  var html = '';
  var yn = function(v) { return v ? 'Yes' : '—'; };
  var ynb = function(v) { return v ? '<b>Yes</b>' : '—'; };
  activeRoute.amenities.forEach(function(a) {
    html += '<tr><td><b>' + a.cp + '</b></td><td>' + a.km + '</td><td>' + yn(a.water) + '</td><td>' + yn(a.fruit) + '</td><td>' + yn(a.food) + '</td><td>' + ynb(a.bagDrop) + '</td><td>' + yn(a.dnfBus) + '</td></tr>';
  });
  document.getElementById('amenities-tbody').innerHTML = html;
}

function renderFuelPlan() {
  var html = '';
  activeRoute.fuelPlan.forEach(function(f) {
    html += '<div class="nutr-row"><div class="nutr-row-label">' + f.label + '</div><div class="nutr-row-desc">' + f.desc + '</div></div>';
  });
  document.getElementById('fuel-plan-rows').innerHTML = html;
  document.getElementById('fuel-plan-tip').innerHTML = activeRoute.fuelTip;
}

function renderAll() {
  renderHeader();
  renderStats();
  renderCourseStats();
  renderElevationSVG();
  renderSegments();
  renderDangerZones();
  document.getElementById('race-pattern').innerHTML = activeRoute.racePattern;
  renderCutoffs();
  renderStrategy();
  renderAmenities();
  renderFuelPlan();
  renderCountdown();
}

function switchRoute(routeId) {
  if (typeof ROUTES === 'undefined' || !ROUTES[routeId]) return;
  activeRoute = ROUTES[routeId];
  if (typeof location !== 'undefined') location.hash = routeId;
  document.querySelectorAll('.route-tab').forEach(function(tab) {
    tab.classList.toggle('active', tab.dataset.route === routeId);
  });
  renderAll();
}

// Init
if (typeof document !== 'undefined' && document.getElementById('cd-days')) {
  document.getElementById('route-tabs').addEventListener('click', function(e) {
    if (e.target.matches('.route-tab')) switchRoute(e.target.dataset.route);
  });
  window.addEventListener('hashchange', function() { switchRoute(getRouteFromHash()); });
  switchRoute(getRouteFromHash());
  setInterval(renderCountdown, 1000);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    computeCountdown, computeElapsed, getRouteFromHash, switchRoute,
    renderAll, renderHeader, renderStats, renderCountdown,
  };
}

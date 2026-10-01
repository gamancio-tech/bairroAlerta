const storageKey = 'bairro-alerta-reports';
const list = document.querySelector('.alert-list');
const markers = document.querySelector('#mapMarkers');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const hazardAreas = [...document.querySelectorAll('.map-hazard')];

const severityLabels = {
  BAIXA: 'BAIXA',
  MEDIA: 'ATENÇÃO',
  ALTA: 'ALERTA ALTO',
  CRITICA: 'ALERTA CRÍTICO'
};

function readSavedAlerts() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function displayCategory(type) {
  if (type === 'alagamento') return 'alagamento';
  if (type === 'chuva') return 'chuva';
  return 'outros';
}

function createAlertCard(alert) {
  const category = displayCategory(alert.type);
  const card = document.createElement('article');
  card.className = `alert-item ${category === 'alagamento' ? 'alert-red' : category === 'chuva' ? 'alert-amber' : 'alert-blue'}`;
  card.dataset.category = category;

  const sign = document.createElement('span');
  sign.className = 'alert-sign';
  sign.setAttribute('aria-hidden', 'true');
  sign.textContent = category === 'outros' ? 'i' : '!';

  const details = document.createElement('div');
  details.className = 'alert-details';
  const meta = document.createElement('div');
  meta.className = 'alert-meta';
  const severity = document.createElement('strong');
  severity.textContent = severityLabels[alert.severity] || 'ATENÇÃO';
  const time = document.createElement('time');
  time.textContent = 'agora';
  meta.append(severity, time);

  const title = document.createElement('h3');
  title.textContent = alert.title;
  const summary = document.createElement('p');
  summary.textContent = `${alert.location} · Raio ${Number(alert.radiusKm).toLocaleString('pt-BR')} km`;
  details.append(meta, title, summary);

  const arrow = document.createElement('span');
  arrow.className = 'alert-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '›';
  card.append(sign, details, arrow);
  return card;
}

function createMapMarker(alert, index) {
  if (!markers) return;

  const marker = document.createElement('span');
  marker.className = 'map-pin';
  marker.dataset.category = displayCategory(alert.type);
  marker.style.left = `${27 + ((index * 23) % 59)}%`;
  marker.style.top = `${32 + ((index * 17) % 42)}%`;
  marker.style.setProperty('--pin-size', `${Math.min(138, Math.max(42, Number(alert.radiusKm) * 18))}px`);
  marker.title = `${alert.title} · raio ${Number(alert.radiusKm).toLocaleString('pt-BR')} km`;
  markers.append(marker);
}

function applyFilter(filter) {
  filterButtons.forEach((button) => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('filter-active', selected);
    button.setAttribute('aria-selected', String(selected));
  });

  list.querySelectorAll('.alert-item').forEach((card) => {
    card.hidden = filter !== 'todos' && card.dataset.category !== filter;
  });

  hazardAreas.forEach((area) => {
    const matches = filter === 'todos'
      || (filter === 'alagamento' && area.classList.contains('map-hazard-flood'))
      || (filter === 'chuva' && area.classList.contains('map-hazard-rain'));
    area.classList.toggle('is-muted', !matches);
  });

  markers?.querySelectorAll('.map-pin').forEach((marker) => {
    marker.hidden = filter !== 'todos' && marker.dataset.category !== filter;
  });
}

// BACKEND: substituir os exemplos do HTML por dados obtidos em GET /api/alerts.
const savedAlerts = readSavedAlerts();
const url = new URL(window.location.href);
let incomingAlert = null;
try {
  incomingAlert = JSON.parse(url.searchParams.get('newAlert') || 'null');
} catch {
  incomingAlert = null;
}

const alertsToRender = incomingAlert && !savedAlerts.some((alert) => alert.id === incomingAlert.id)
  ? [incomingAlert, ...savedAlerts]
  : savedAlerts;

if (incomingAlert) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(alertsToRender));
  } catch {
    // O alerta já está no feed desta navegação, mesmo sem armazenamento persistente.
  }
  url.searchParams.delete('newAlert');
  window.history.replaceState(null, '', `${url.pathname}${url.hash}`);
}

alertsToRender.forEach((alert, index) => {
  list.prepend(createAlertCard(alert));
  createMapMarker(alert, index);
});

const totalBadge = document.querySelector('.filter-count');
if (totalBadge) totalBadge.textContent = String(list.querySelectorAll('.alert-item').length);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => applyFilter(button.dataset.filter));
});

// Mural, navegação de categorias, pins e detalhes de alertas. 🔌 BACKEND: GET /api/alerts e GET /api/alerts/:id são conectados pela API.
(function () {
  'use strict';

  const api = window.BairroAlertaAPI;
  const list = document.querySelector('#alertList');
  const tabs = document.querySelector('#alertTabs');
  const markers = document.querySelector('#mapMarkers');
  const emptyState = document.querySelector('#alertEmpty');
  const errorState = document.querySelector('#alertLoadError');
  const resultCount = document.querySelector('#activeAlertCount');
  const detailDialog = document.querySelector('#alertDetailDialog');
  const closeDetailButton = document.querySelector('.alert-detail-close');
  const PIXELS_PER_KM = 18;
  const MIN_CIRCLE_SIZE = 24;
  const MAX_CIRCLE_SIZE = 200;
  let allAlerts = [];
  let activeType = 'TODOS';
  let lastOpenedElement = null;
  let selectedAlertId = null;
  let toastTimer = null;

  function getType(type) {
    return api.ALERT_TYPES.find((item) => item.value === String(type).toUpperCase()) || api.ALERT_TYPES.at(-1);
  }

  function getSeverity(severity) {
    return api.SEVERITIES.find((item) => item.value === String(severity).toUpperCase()) || api.SEVERITIES[1];
  }

  function getInitialType() {
    const hashMatch = window.location.hash.match(/^#alertas\?tipo=([A-Z_]+)$/i);
    const fromHash = hashMatch ? decodeURIComponent(hashMatch[1]).toUpperCase() : '';
    let fromSession = '';
    try {
      fromSession = window.sessionStorage.getItem('bairro-alerta-active-type') || '';
    } catch {
      fromSession = '';
    }
    const saved = fromHash || fromSession;
    return saved === 'TODOS' || api.ALERT_TYPES.some((item) => item.value === saved) ? saved || 'TODOS' : 'TODOS';
  }

  function writeActiveType(type) {
    try {
      window.sessionStorage.setItem('bairro-alerta-active-type', type);
    } catch {
      // O hash continua preservando a categoria quando sessionStorage não está disponível.
    }
    const url = new URL(window.location.href);
    url.hash = `alertas?tipo=${encodeURIComponent(type)}`;
    window.history.replaceState(null, '', url.href);
  }

  function getPosition(alert) {
    const xValue = Number(alert.mapX);
    const yValue = Number(alert.mapY);
    if (alert.mapX !== undefined && alert.mapY !== undefined && Number.isFinite(xValue) && Number.isFinite(yValue)) {
      return { x: Math.max(8, Math.min(92, xValue)), y: Math.max(8, Math.min(92, yValue)) };
    }

    const id = String(alert.id || alert.title || 'alerta');
    let hash = 0;
    for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) | 0;
    return {
      x: 8 + (Math.abs(hash) % 8401) / 100,
      y: 8 + (Math.abs((hash * 17) | 0) % 8401) / 100
    };
  }

  function circleSize(alert) {
    const radius = Number(alert.radiusKm);
    const safeRadius = Number.isFinite(radius) ? radius : 1;
    return Math.max(MIN_CIRCLE_SIZE, Math.min(MAX_CIRCLE_SIZE, safeRadius * PIXELS_PER_KM));
  }

  function createAlertCard(alert) {
    const type = getType(alert.type);
    const severity = getSeverity(alert.severity);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `alert-item alert-severity-${severity.value.toLowerCase()}`;
    card.dataset.alertId = String(alert.id);
    card.dataset.type = type.value;
    card.style.setProperty('--severity-color', severity.color);
    card.setAttribute('aria-label', `Abrir alerta: ${alert.title}. ${type.label}. Gravidade ${severity.label}.`);

    const sign = document.createElement('span');
    sign.className = 'alert-sign';
    sign.setAttribute('aria-hidden', 'true');
    sign.textContent = type.icon;

    const details = document.createElement('span');
    details.className = 'alert-details';
    const meta = document.createElement('span');
    meta.className = 'alert-meta';
    const badge = document.createElement('span');
    badge.className = 'alert-severity-badge';
    badge.textContent = severity.label;
    const time = document.createElement('time');
    time.dataset.createdAt = alert.createdAt;
    time.textContent = api.formatRelativeTime(alert.createdAt);
    meta.append(badge, time);

    const title = document.createElement('span');
    title.className = 'alert-card-title';
    title.textContent = alert.title;
    const summary = document.createElement('span');
    summary.className = 'alert-card-summary';
    summary.textContent = `${alert.location || 'Localização não informada'} · Raio ${Number(alert.radiusKm || 0).toLocaleString('pt-BR')} km`;
    details.append(meta, title, summary);

    const arrow = document.createElement('span');
    arrow.className = 'alert-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '›';
    card.append(sign, details, arrow);
    card.addEventListener('click', () => openDetails(alert.id, card));
    return card;
  }

  function createMapMarker(alert) {
    const type = getType(alert.type);
    const severity = getSeverity(alert.severity);
    const position = getPosition(alert);
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'map-pin';
    marker.dataset.alertId = String(alert.id);
    marker.dataset.type = type.value;
    marker.style.left = `${position.x}%`;
    marker.style.top = `${position.y}%`;
    marker.style.setProperty('--pin-size', `${circleSize(alert)}px`);
    marker.style.setProperty('--severity-color', severity.color);
    marker.setAttribute('aria-label', `Abrir alerta no mapa: ${alert.title}. ${type.label}. Gravidade ${severity.label}. Raio ${alert.radiusKm} km.`);
    marker.addEventListener('click', () => openDetails(alert.id, marker));
    return marker;
  }

  function renderTabs() {
    const fragment = document.createDocumentFragment();
    const tabDefinitions = [{ value: 'TODOS', label: 'Todos', icon: '⌁' }, ...api.ALERT_TYPES];
    tabDefinitions.forEach((type) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'alert-tab';
      button.id = `alert-tab-${type.value.toLowerCase()}`;
      button.dataset.type = type.value;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', 'alertList');
      button.setAttribute('aria-selected', 'false');

      const icon = document.createElement('span');
      icon.className = 'alert-tab-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = type.icon;
      const label = document.createElement('span');
      label.textContent = type.label;
      const count = document.createElement('span');
      count.className = 'alert-tab-count';
      count.dataset.countFor = type.value;
      count.textContent = '0';
      button.append(icon, label, count);
      button.addEventListener('click', () => selectType(type.value));
      fragment.append(button);
    });
    tabs.replaceChildren(fragment);
  }

  function countsByType() {
    const counts = new Map(api.ALERT_TYPES.map((type) => [type.value, 0]));
    allAlerts.forEach((alert) => counts.set(getType(alert.type).value, counts.get(getType(alert.type).value) + 1));
    return counts;
  }

  function updateCounts() {
    const counts = countsByType();
    let visibleCount = 0;
    tabs.querySelectorAll('.alert-tab').forEach((tab) => {
      const count = tab.dataset.type === 'TODOS' ? allAlerts.length : counts.get(tab.dataset.type) || 0;
      tab.querySelector('.alert-tab-count').textContent = String(count);
      if (tab.dataset.type === 'TODOS' || tab.dataset.type === activeType) visibleCount = count;
    });
    resultCount.textContent = String(visibleCount);
  }

  function renderAlerts() {
    const fragment = document.createDocumentFragment();
    markers.replaceChildren();
    allAlerts.forEach((alert) => {
      fragment.append(createAlertCard(alert));
      markers.append(createMapMarker(alert));
    });
    list.replaceChildren(fragment);
    list.setAttribute('aria-busy', 'false');
    updateCounts();
    applyFilter(activeType, false);
    updateRelativeTimes();
  }

  function applyFilter(type, persist = true) {
    activeType = type;
    tabs.querySelectorAll('.alert-tab').forEach((tab) => {
      const selected = tab.dataset.type === type;
      tab.setAttribute('aria-selected', String(selected));
      if (selected) tab.setAttribute('aria-current', 'true');
      else tab.removeAttribute('aria-current');
    });

    let visibleCount = 0;
    list.querySelectorAll('.alert-item').forEach((card) => {
      const visible = type === 'TODOS' || card.dataset.type === type;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    markers.querySelectorAll('.map-pin').forEach((marker) => {
      marker.hidden = type !== 'TODOS' && marker.dataset.type !== type;
    });

    resultCount.textContent = String(visibleCount);
    emptyState.hidden = visibleCount > 0;
    errorState.hidden = true;
    if (persist) writeActiveType(type);
  }

  function selectType(type) {
    applyFilter(type);
  }

  function handleTabKeydown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const tabButtons = [...tabs.querySelectorAll('[role="tab"]')];
    const currentTab = event.target.closest('[role="tab"]');
    const index = tabButtons.indexOf(currentTab);
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabButtons.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length;
    tabButtons[nextIndex].focus();
    tabButtons[nextIndex].click();
  }

  function setText(id, value) {
    document.querySelector(`#${id}`).textContent = value == null || value === '' ? 'Não informado' : String(value);
  }

  async function openDetails(id, opener) {
    // 🔌 BACKEND: GET /api/alerts/:id para carregar os detalhes completos do alerta.
    lastOpenedElement = opener;
    selectedAlertId = String(id);
    markers.querySelectorAll('.map-pin').forEach((pin) => pin.classList.toggle('is-selected', pin.dataset.alertId === selectedAlertId));
    list.querySelectorAll('.alert-item').forEach((card) => card.setAttribute('aria-pressed', String(card.dataset.alertId === selectedAlertId)));

    let alert = allAlerts.find((item) => String(item.id) === selectedAlertId);
    try {
      alert = await api.getAlertById(id) || alert;
    } catch {
      // Os dados da listagem permanecem disponíveis se o endpoint de detalhe falhar.
    }
    if (!alert) return;

    const type = getType(alert.type);
    const severity = getSeverity(alert.severity);
    setText('detailType', `${type.icon} ${type.label}`);
    setText('detailTitle', alert.title);
    setText('detailDescription', alert.description);
    setText('detailLocation', alert.location);
    setText('detailRadius', `${Number(alert.radiusKm || 0).toLocaleString('pt-BR')} km`);
    setText('detailAuthor', alert.author);
    setText('detailRelative', `Publicado ${api.formatRelativeTime(alert.createdAt)}`);
    const date = new Date(alert.createdAt);
    setText('detailDate', Number.isNaN(date.getTime()) ? 'Não informado' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date));
    const detailBadge = document.querySelector('#detailSeverity');
    detailBadge.textContent = severity.label;
    detailBadge.style.setProperty('--severity-color', severity.color);
    if (!detailDialog.open) detailDialog.showModal();
    closeDetailButton.focus();
  }

  function closeDetails() {
    if (detailDialog.open) detailDialog.close();
  }

  function restoreDetailFocus() {
    markers.querySelectorAll('.map-pin').forEach((pin) => pin.classList.remove('is-selected'));
    list.querySelectorAll('.alert-item').forEach((card) => card.setAttribute('aria-pressed', 'false'));
    if (lastOpenedElement?.isConnected) lastOpenedElement.focus();
    lastOpenedElement = null;
    selectedAlertId = null;
  }

  function updateRelativeTimes() {
    list.querySelectorAll('time[data-created-at]').forEach((time) => {
      time.textContent = api.formatRelativeTime(time.dataset.createdAt);
    });
  }

  async function loadAlerts() {
    list.setAttribute('aria-busy', 'true');
    list.replaceChildren();
    emptyState.hidden = true;
    errorState.hidden = true;
    const loading = document.createElement('p');
    loading.className = 'alert-loading';
    loading.textContent = 'Carregando alertas...';
    list.append(loading);
    try {
      allAlerts = await api.getAlerts();
      allAlerts.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
      renderAlerts();
    } catch (error) {
      list.setAttribute('aria-busy', 'false');
      list.replaceChildren();
      errorState.hidden = false;
      errorState.querySelector('p').textContent = error.message || 'Não foi possível carregar os alertas.';
    }
  }

  function showToast(message) {
    const toast = document.querySelector('#siteToast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function renderAccountActions() {
    const container = document.querySelector('#accountActions');
    const fragment = document.createDocumentFragment();
    if (api.isAuthenticated()) {
      const greeting = document.createElement('span');
      greeting.className = 'auth-greeting';
      greeting.textContent = `Olá, ${api.getUser()?.name || 'morador'}`;
      const logoutButton = document.createElement('button');
      logoutButton.type = 'button';
      logoutButton.className = 'auth-logout';
      logoutButton.textContent = 'Sair';
      logoutButton.addEventListener('click', () => {
        api.logout();
        window.location.reload();
      });
      fragment.append(greeting, logoutButton);
    } else {
      const loginLink = document.createElement('a');
      loginLink.className = 'auth-entry';
      loginLink.href = 'pages/login.html';
      loginLink.textContent = 'Entrar';
      const registerLink = document.createElement('a');
      registerLink.className = 'auth-create';
      registerLink.href = 'pages/cadastro.html';
      registerLink.textContent = 'Criar conta';
      fragment.append(loginLink, registerLink);
    }
    container.replaceChildren(fragment);
  }

  function setupAuthenticationLinks() {
    document.querySelectorAll('[data-auth-required]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (api.isAuthenticated()) return;
        event.preventDefault();
        window.location.href = 'pages/login.html?redirect=criar-alerta';
      });
    });
  }

  function setupNavigation() {
    const menuButton = document.querySelector('.menu-button');
    const nav = document.querySelector('#mainNav');
    const navLinks = [...nav.querySelectorAll('[data-nav-target]')];
    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    navLinks.forEach((link) => link.addEventListener('click', () => {
      setMenu(false);
      navLinks.forEach((item) => item.classList.toggle('active', item === link));
    }));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenu(false);
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => link.classList.toggle('active', link.dataset.navTarget === visible.target.id));
      }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, .15, .4] });
      navLinks.forEach((link) => {
        const section = document.getElementById(link.dataset.navTarget);
        if (section) observer.observe(section);
      });
    }
  }

  function setupDetails() {
    closeDetailButton.addEventListener('click', closeDetails);
    detailDialog.addEventListener('click', (event) => {
      if (event.target === detailDialog) closeDetails();
    });
    detailDialog.addEventListener('close', restoreDetailFocus);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && detailDialog.open) closeDetails();
    });
  }

  function setupActions() {
    document.querySelectorAll('[data-toast]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        showToast(button.dataset.toast);
      });
    });
    document.querySelector('[data-select-all]').addEventListener('click', () => {
      selectType('TODOS');
      list.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    document.querySelector('[data-retry-alerts]').addEventListener('click', loadAlerts);
  }

  renderTabs();
  activeType = getInitialType();
  renderAccountActions();
  setupAuthenticationLinks();
  setupNavigation();
  setupDetails();
  setupActions();
  tabs.addEventListener('keydown', handleTabKeydown);
  loadAlerts();
  window.setInterval(updateRelativeTimes, 60000);
})();

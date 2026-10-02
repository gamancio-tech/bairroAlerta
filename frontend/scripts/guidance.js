// Renderiza orientações, abas, checklist e controles do cabeçalho.
// 🔌 BACKEND (opcional): as orientações poderiam vir de GET /api/guidance no futuro; por ora ficam em guidance-data.js.
(function () {
  'use strict';

  const api = window.BairroAlertaAPI;
  const data = window.BairroAlertaGuidance;
  const types = api?.ALERT_TYPES || Object.keys(data).map((value) => ({
    value,
    label: value === 'CHUVA' ? 'Chuva forte' : value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
    icon: '⚠️',
    color: '#d62e31'
  }));
  const isAuthenticated = () => Boolean(api?.isAuthenticated?.());
  const tabs = document.querySelector('#guidanceTabs');
  const panel = document.querySelector('#guidancePanel');
  let selectedType = new URLSearchParams(location.search).get('tipo')?.toUpperCase();
  if (!types.some((type) => type.value === selectedType)) selectedType = 'ENCHENTE';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function renderList(title, items, className = '') {
    const section = el('section', `tips-block ${className}`);
    const list = el('ul', 'tips-list');
    section.append(el('h2', 'tips-block-title', title));
    items.forEach((item) => list.append(el('li', '', item)));
    section.append(list);
    return section;
  }

  function render(type, updateUrl = true) {
    selectedType = type;
    const info = types.find((item) => item.value === type);
    const guide = data[type];
    tabs.querySelectorAll('[role="tab"]').forEach((tab) => {
      const active = tab.dataset.type === type;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panel.replaceChildren();
    panel.style.setProperty('--accent', info.color);
    panel.setAttribute('aria-labelledby', `tips-tab-${type.toLowerCase()}`);

    const heading = el('header', 'tips-guide-heading');
    const title = el('div', 'tips-guide-title');
    heading.append(el('span', 'tips-guide-icon', info.icon));
    title.append(el('p', 'tips-kicker', 'Guia de segurança'));
    title.append(el('h2', '', info.label), el('p', 'tips-summary', guide.resumo));
    heading.append(title);
    panel.append(heading);
    if (guide.sinais?.length) panel.append(renderList('Sinais de alerta', guide.sinais, 'tips-signs'));

    const phases = el('div', 'tips-phases');
    const phaseBlocks = [
      ['Antes', guide.antes],
      ['Durante', guide.durante],
      ['Depois', guide.depois]
    ];
    phaseBlocks.forEach(([label, actions]) => phases.append(renderList(label, actions)));
    panel.append(phases, renderList('O que NÃO fazer', guide.naoFazer, 'tips-danger'));

    const emergency = el('section', 'tips-when-call');
    emergency.append(el('h2', 'tips-block-title', 'Quando ligar'));
    emergency.append(el('p', '', `Em caso de risco relacionado a ${info.label.toLowerCase()}:`));
    const numbers = guide.ligar.numero.match(/\d+/g) || [];
    const names = guide.ligar.nome.split('/').map((name) => name.trim());
    numbers.forEach((number, index) => {
      const phone = el('a', 'tips-phone', `${names[index] || names[0]} ${number}`);
      phone.href = `tel:${number}`;
      emergency.append(phone);
    });
    panel.append(emergency);

    const report = el('a', 'tips-report', `＋ Reportar ocorrência de ${info.label.toLowerCase()}`);
    report.href = isAuthenticated() ? `criar-alerta.html?tipo=${type}` : 'login.html?redirect=criar-alerta';
    report.addEventListener('click', (event) => {
      if (isAuthenticated()) return;
      event.preventDefault();
      location.href = report.href;
    });
    panel.append(report);

    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('tipo', type);
      history.replaceState(null, '', url.href);
    }
    renderAlertCount(type);
  }

  async function renderAlertCount(type) {
    if (typeof api?.getAlerts !== 'function') return;
    try {
      const alerts = await api.getAlerts({ type });
      if (type !== selectedType) return;
      const status = el('section', 'tips-alert-status');
      const message = alerts.length
        ? `${alerts.length} alertas ativos deste tipo na sua região`
        : 'Nenhum alerta ativo neste momento';
      status.append(el('p', 'tips-alert-count', message));
      if (alerts.length) {
        const link = el('a', 'tips-alert-link', 'Ver alertas deste tipo →');
        link.href = '../index.html#alertas';
        link.addEventListener('click', () => {
          try {
            sessionStorage.setItem('bairro-alerta-active-type', type);
          } catch {
            // O link continua levando ao mural se o navegador bloquear o armazenamento.
          }
        });
        status.append(link);
      }
      panel.append(status);
    } catch {
      // Falha no contador não bloqueia as orientações estáticas.
    }
  }

  types.forEach((type) => {
    const tab = el('button', 'tips-tab');
    tab.type = 'button';
    tab.id = `tips-tab-${type.value.toLowerCase()}`;
    tab.dataset.type = type.value;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'guidancePanel');
    tab.append(el('span', 'tips-tab-icon', type.icon), el('span', '', type.label));
    tab.addEventListener('click', () => render(type.value));
    tabs.append(tab);
  });

  tabs.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...tabs.querySelectorAll('[role="tab"]')];
    const index = buttons.indexOf(event.target.closest('[role="tab"]'));
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = event.key === 'Home' ? 0 : event.key === 'End'
      ? buttons.length - 1
      : (index + direction + buttons.length) % buttons.length;
    buttons[next].focus();
    buttons[next].click();
  });

  function makeChecklist() {
    const host = document.querySelector('#guidanceKit');
    const list = el('ul', 'tips-kit-list');
    let checked = new Set();
    try {
      checked = new Set(JSON.parse(localStorage.getItem('bairro-alerta-kit') || '[]'));
    } catch {
      checked = new Set();
    }
    window.BairroAlertaKit.forEach((item, index) => {
      const row = el('li', 'tips-kit-item');
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `tips-kit-${index}`;
      checkbox.checked = checked.has(item);
      checkbox.addEventListener('change', () => {
        checkbox.checked ? checked.add(item) : checked.delete(item);
        try {
          localStorage.setItem('bairro-alerta-kit', JSON.stringify([...checked]));
        } catch {
          // O checklist continua utilizável durante esta visita.
        }
      });
      label.htmlFor = checkbox.id;
      label.append(checkbox, el('span', '', item));
      row.append(label);
      list.append(row);
    });
    host.append(el('p', 'tips-kicker', 'Prepare-se'));
    host.append(el('h2', '', 'Kit de emergência'), list);
  }

  function makeFamilyPlan() {
    const host = document.querySelector('#familyPlan');
    const questions = el('ol', 'tips-family-list');
    window.BairroAlertaFamilyPlan.forEach((question) => questions.append(el('li', '', question)));
    host.append(el('p', 'tips-kicker', 'Conversem em casa'));
    host.append(el('h2', '', 'Plano da família'), questions);
  }

  function setupHeader() {
    const account = document.querySelector('#tipsAccount');
    if (isAuthenticated()) {
      account.append(el('span', 'tips-greeting', `Olá, ${api?.getUser?.()?.name || 'morador'}`));
      const logout = el('button', 'tips-logout', 'Sair');
      logout.type = 'button';
      logout.addEventListener('click', () => {
        api?.logout?.();
        location.reload();
      });
      account.append(logout);
    } else {
      [['Entrar', 'login.html', 'tips-login'], ['Criar conta', 'cadastro.html', 'tips-register']].forEach(([text, href, className]) => {
        const link = el('a', className, text);
        link.href = href;
        account.append(link);
      });
    }

    document.querySelector('[data-tips-report]').addEventListener('click', (event) => {
      if (isAuthenticated()) return;
      event.preventDefault();
      location.href = 'login.html?redirect=criar-alerta';
    });
  }

  function setupMenu() {
    const nav = document.querySelector('#tipsNav');
    const menu = document.querySelector('#tipsMenu');
    const setMenu = (open) => {
      nav.classList.toggle('tips-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenu(false);
    });
  }

  function setupToast() {
    const toast = document.querySelector('#tipsToast');
    let timer;
    document.querySelector('[data-tips-toast]').addEventListener('click', () => {
      toast.textContent = 'Recurso disponível em breve';
      toast.classList.add('tips-toast-visible');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('tips-toast-visible'), 2500);
    });
  }

  makeChecklist();
  makeFamilyPlan();
  setupHeader();
  setupMenu();
  setupToast();
  render(selectedType, false);
})();

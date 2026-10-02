// API comum de autenticação e alertas. 🔌 BACKEND: POST /api/auth/login, POST /api/auth/register, GET /api/alerts e POST /api/alerts.
(function () {
  'use strict';

  // 🔌 BACKEND URL: Em localhost usa a porta 3333; no Vercel/Produção conecta à URL do Render
  const PRODUCTION_API_URL = 'https://SEU-BACKEND.onrender.com/api'; // Insira aqui a URL gerada no Render
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:'
  );
  const API_URL = isLocalhost ? 'http://localhost:3333/api' : (window.__API_URL__ || PRODUCTION_API_URL);
  const USE_MOCK = false;
  const TOKEN_KEY = 'bairro-alerta-token';
  const USER_KEY = 'bairro-alerta-user';
  const ALERTS_KEY = 'bairro-alerta-reports';
  const ALERT_TYPES = Object.freeze([
    { value: 'ENCHENTE', label: 'Enchente', icon: '🌊', color: '#2878a5' },
    { value: 'ALAGAMENTO', label: 'Alagamento', icon: '💧', color: '#347ea0' },
    { value: 'CHUVA', label: 'Chuva forte', icon: '🌧️', color: '#5372a4' },
    { value: 'DESLIZAMENTO', label: 'Deslizamento', icon: '⛰️', color: '#85664f' },
    { value: 'TEMPESTADE', label: 'Tempestade', icon: '⛈️', color: '#665f87' },
    { value: 'VENDAVAL', label: 'Vendaval', icon: '💨', color: '#547b79' },
    { value: 'CALOR_EXTREMO', label: 'Calor extremo', icon: '☀️', color: '#c96c35' },
    { value: 'OUTROS', label: 'Outros', icon: '⚠️', color: '#68777c' }
  ]);
  const SEVERITIES = Object.freeze([
    { value: 'BAIXA', label: 'Baixa', color: '#258260' },
    { value: 'MEDIA', label: 'Média', color: '#bd8b27' },
    { value: 'ALTA', label: 'Alta', color: '#e57927' },
    { value: 'CRITICA', label: 'Crítica', color: '#d62e31' }
  ]);
  let memoryToken = null;
  let memoryUser = null;

  function saveToken(token) {
    memoryToken = token;
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // A sessão continua disponível em memória quando o navegador bloqueia o armazenamento.
    }
  }

  function getToken() {
    try {
      return window.localStorage.getItem(TOKEN_KEY) || memoryToken;
    } catch {
      return memoryToken;
    }
  }

  function removeToken() {
    memoryToken = null;
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // O estado em memória também é removido acima.
    }
  }

  function isAuthenticated() {
    return Boolean(getToken());
  }

  function saveUser(user) {
    memoryUser = user;
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // A sessão continua disponível em memória quando o navegador bloqueia o armazenamento.
    }
  }

  function getUser() {
    try {
      const storedUser = window.localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : memoryUser;
    } catch {
      return memoryUser;
    }
  }

  function removeUser() {
    memoryUser = null;
    try {
      window.localStorage.removeItem(USER_KEY);
    } catch {
      // O estado em memória também é removido acima.
    }
  }

  function logout() {
    // 🔌 BACKEND: ponto para integrar a invalidação de sessão e o botão Sair.
    removeToken();
    removeUser();
  }

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

    let response;
    try {
      response = await window.fetch(`${API_URL}${path}`, {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
      });
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
    }

    if (response.status === 401) {
      logout();
      throw new Error('Sessão expirada. Entre novamente.');
    }

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Não foi possível concluir a solicitação.');
    }
    return data;
  }

  async function loginMock({ email, password }) {
    await wait(550);
    if (password === '000000') throw new Error('E-mail ou senha incorretos');
    return {
      token: 'mock-jwt-bairro-alerta-login',
      user: { id: 'mock-user-001', name: email.split('@')[0], email }
    };
  }

  async function registerMock({ name, email }) {
    await wait(550);
    if (email.trim().toLowerCase() === 'teste@teste.com') throw new Error('E-mail já cadastrado');
    return {
      token: 'mock-jwt-bairro-alerta-register',
      user: { id: 'mock-user-002', name, email },
      message: 'Cadastro realizado com sucesso.'
    };
  }

  function normalizeType(type) {
    const aliases = {
      enchente: 'ENCHENTE',
      alagamento: 'ALAGAMENTO',
      chuva: 'CHUVA',
      deslizamento: 'DESLIZAMENTO',
      tempestade: 'TEMPESTADE',
      vendaval: 'VENDAVAL',
      calor: 'CALOR_EXTREMO',
      calor_extremo: 'CALOR_EXTREMO',
      outros: 'OUTROS'
    };
    const normalized = String(type || '').trim().toUpperCase();
    return aliases[normalized.toLowerCase()] || normalized;
  }

  function migrateStoredAlerts() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(ALERTS_KEY) || '[]');
      if (!Array.isArray(stored)) return [];
      let changed = false;
      const migrated = stored.map((alert) => {
        const type = normalizeType(alert.type);
        if (type !== alert.type) changed = true;
        return { ...alert, type };
      });
      if (changed) window.localStorage.setItem(ALERTS_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return [];
    }
  }

  function dateMinutesAgo(minutes) {
    return new Date(Date.now() - minutes * 60 * 1000).toISOString();
  }

  // ===== DADOS MOCK (remover ao conectar o backend) =====
  const MOCK_ALERTS = [
    { id: 'mock-001', title: 'Água subindo perto do córrego', type: 'ALAGAMENTO', severity: 'CRITICA', description: 'O nível da água está subindo rapidamente e já cobre parte da calçada. Evite a travessia e procure uma rua mais alta.', location: 'Vila das Flores · Rua do Córrego', radiusKm: 1.5, mapX: 69, mapY: 48, createdAt: dateMinutesAgo(12), author: 'Marina Costa' },
    { id: 'mock-002', title: 'Chuva forte e baixa visibilidade', type: 'CHUVA', severity: 'ALTA', description: 'Chuva intensa com visibilidade reduzida para motoristas e pedestres. Redobre a atenção nas vias abertas.', location: 'Jardim do Vale · Avenida Norte', radiusKm: 2, mapX: 62, mapY: 33, createdAt: dateMinutesAgo(38), author: 'Rafael Lima' },
    { id: 'mock-003', title: 'Abrigo comunitário aberto', type: 'OUTROS', severity: 'BAIXA', description: 'A escola do bairro está recebendo moradores que precisem de um local seguro durante a chuva.', location: 'Centro · Escola Municipal', radiusKm: 0.8, mapX: 49, mapY: 66, createdAt: dateMinutesAgo(60), author: 'Equipe Bairro Alerta' },
    { id: 'mock-004', title: 'Enxurrada atravessa a Rua do Mercado', type: 'ENCHENTE', severity: 'ALTA', description: 'A enxurrada está avançando pela rua. Não tente atravessar com veículos ou a pé.', location: 'Centro · Rua do Mercado', radiusKm: 1.1, mapX: 42, mapY: 54, createdAt: dateMinutesAgo(180), author: 'João Pedro' },
    { id: 'mock-005', title: 'Risco de deslizamento em encosta', type: 'DESLIZAMENTO', severity: 'CRITICA', description: 'Moradores observaram movimentação de terra e rachaduras no barranco após horas de chuva.', location: 'Morro da Estação · Parte alta', radiusKm: 2.4, mapX: 79, mapY: 25, createdAt: dateMinutesAgo(360), author: 'Lúcia Ferreira' },
    { id: 'mock-006', title: 'Rajadas fortes derrubaram galhos', type: 'VENDAVAL', severity: 'MEDIA', description: 'Galhos caíram na calçada e há objetos soltos com o vento. Evite a praça até a passagem ser liberada.', location: 'Parque das Acácias · Praça central', radiusKm: 1.7, mapX: 29, mapY: 39, createdAt: dateMinutesAgo(720), author: 'Pedro Alves' },
    { id: 'mock-007', title: 'Alerta de tempestade nas próximas horas', type: 'TEMPESTADE', severity: 'MEDIA', description: 'Nuvens carregadas se aproximam. Recolha objetos de áreas abertas e acompanhe os próximos avisos.', location: 'Jardim do Vale · Região leste', radiusKm: 3.5, mapX: 84, mapY: 61, createdAt: dateMinutesAgo(1440), author: 'Defesa do Bairro' },
    { id: 'mock-008', title: 'Temperatura elevada durante a tarde', type: 'CALOR_EXTREMO', severity: 'BAIXA', description: 'Procure sombra, mantenha-se hidratado e evite atividades físicas ao sol nos horários mais quentes.', location: 'Vila das Flores · Toda a região', radiusKm: 4, mapX: 18, mapY: 78, createdAt: dateMinutesAgo(2880), author: 'Marina Costa' }
  ];

  async function login(credentials) {
    // 🔌 BACKEND: POST /api/auth/login — enviar { email, password }; receber { token, user } e salvar o token JWT.
    const result = USE_MOCK
      ? await loginMock(credentials)
      : await request('/auth/login', { method: 'POST', body: credentials });
    if (!result.token || !result.user) throw new Error('A resposta do servidor não contém os dados necessários para entrar.');
    saveToken(result.token);
    saveUser(result.user);
    return result;
  }

  async function register(details) {
    // 🔌 BACKEND: POST /api/auth/register — enviar { name, email, password }; receber confirmação ou { token, user }.
    return USE_MOCK
      ? registerMock(details)
      : request('/auth/register', { method: 'POST', body: details });
  }

  async function getAlerts({ type } = {}) {
    // 🔌 BACKEND: GET /api/alerts (público) — receber a lista de alertas recentes.
    let alerts;
    if (USE_MOCK) {
      alerts = [...MOCK_ALERTS, ...migrateStoredAlerts()];
    } else {
      const result = await request('/alerts');
      alerts = Array.isArray(result) ? result : result.alerts || [];
      alerts = alerts.map((alert) => ({ ...alert, type: normalizeType(alert.type) }));
    }
    const sorted = alerts.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
    return type ? sorted.filter((alert) => normalizeType(alert.type) === normalizeType(type)) : sorted;
  }

  async function getAlertById(id) {
    // 🔌 BACKEND: GET /api/alerts/:id (público) — carregar os detalhes completos do alerta.
    if (USE_MOCK) {
      const alerts = await getAlerts();
      return alerts.find((alert) => String(alert.id) === String(id)) || null;
    }
    return request(`/alerts/${encodeURIComponent(id)}`);
  }

  async function createAlert(data) {
    // 🔌 BACKEND: POST /api/alerts (JWT) — enviar dados do alerta e receber o alerta criado.
    if (!isAuthenticated()) throw new Error('Entre na sua conta para reportar uma ocorrência.');
    const payload = { ...data, type: normalizeType(data.type) };
    if (USE_MOCK) {
      const user = getUser() || {};
      const alert = {
        ...payload,
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        userId: user.id || null,
        author: user.name || 'Morador da comunidade',
        mapX: Number.isFinite(Number(payload.mapX)) ? Number(payload.mapX) : 50,
        mapY: Number.isFinite(Number(payload.mapY)) ? Number(payload.mapY) : 50
      };
      const saved = migrateStoredAlerts();
      saved.push(alert);
      try {
        window.localStorage.setItem(ALERTS_KEY, JSON.stringify(saved));
      } catch {
        throw new Error('Não foi possível salvar o alerta neste navegador.');
      }
      return alert;
    }
    return request('/alerts', { method: 'POST', body: payload, auth: true });
  }

  function formatRelativeTime(isoDate) {
    const elapsed = Math.max(0, Date.now() - new Date(isoDate).getTime());
    if (!Number.isFinite(elapsed)) return 'agora';
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  window.BairroAlertaAPI = Object.freeze({
    API_URL,
    USE_MOCK,
    ALERT_TYPES,
    SEVERITIES,
    saveToken,
    getToken,
    removeToken,
    isAuthenticated,
    saveUser,
    getUser,
    removeUser,
    logout,
    request,
    register,
    login,
    getAlerts,
    getAlertById,
    createAlert,
    formatRelativeTime
  });
})();

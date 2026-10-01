(function () {
  'use strict';

  const API_URL = 'http://localhost:3333/api';
  const USE_MOCK = true;
  const TOKEN_KEY = 'bairro-alerta-token';
  const USER_KEY = 'bairro-alerta-user';
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

  async function request(path, payload) {
    let response;
    try {
      response = await window.fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
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
    if (password === '000000') {
      throw new Error('E-mail ou senha incorretos');
    }
    return {
      token: 'mock-jwt-bairro-alerta-login',
      user: {
        id: 'mock-user-001',
        name: email.split('@')[0],
        email
      }
    };
  }

  async function registerMock({ name, email }) {
    await wait(550);
    if (email.trim().toLowerCase() === 'teste@teste.com') {
      throw new Error('E-mail já cadastrado');
    }
    return {
      token: 'mock-jwt-bairro-alerta-register',
      user: {
        id: 'mock-user-002',
        name,
        email
      },
      message: 'Cadastro realizado com sucesso.'
    };
  }

  async function login(credentials) {
    // 🔌 BACKEND: POST /api/auth/login — enviar { email, password }; receber { token, user } e salvar o token JWT.
    const result = USE_MOCK
      ? await loginMock(credentials)
      : await request('/auth/login', credentials);

    if (!result.token || !result.user) {
      throw new Error('A resposta do servidor não contém os dados necessários para entrar.');
    }
    saveToken(result.token);
    saveUser(result.user);
    return result;
  }

  async function register(details) {
    // 🔌 BACKEND: POST /api/auth/register — enviar { name, email, password }; receber confirmação ou { token, user }.
    return USE_MOCK
      ? registerMock(details)
      : await request('/auth/register', details);
  }

  window.BairroAlertaAPI = Object.freeze({
    API_URL,
    USE_MOCK,
    saveToken,
    getToken,
    removeToken,
    isAuthenticated,
    saveUser,
    getUser,
    removeUser,
    logout,
    register,
    login
  });
})();

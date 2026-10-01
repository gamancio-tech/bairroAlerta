(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const api = window.BairroAlertaAPI;
    const form = document.querySelector('#loginForm');
    const emailInput = document.querySelector('#loginEmail');
    const passwordInput = document.querySelector('#loginPassword');
    const emailError = document.querySelector('#loginEmailError');
    const passwordError = document.querySelector('#loginPasswordError');
    const generalError = document.querySelector('#loginError');
    const submitButton = form.querySelector('[type="submit"]');
    const submitLabel = submitButton.querySelector('.auth-btn-label');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 🔌 BACKEND: validar token ao carregar a página, caso exista uma rota de validação disponível.
    if (api.isAuthenticated()) {
      window.location.replace('../index.html');
      return;
    }

    document.querySelectorAll('[data-auth-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        const input = document.getElementById(button.dataset.authToggle);
        const willShow = input.type === 'password';
        input.type = willShow ? 'text' : 'password';
        button.textContent = willShow ? 'Ocultar' : 'Mostrar';
        button.setAttribute('aria-label', willShow ? 'Ocultar senha' : 'Mostrar senha');
        button.setAttribute('aria-pressed', String(willShow));
      });
    });

    function clearErrors() {
      emailError.textContent = '';
      passwordError.textContent = '';
      generalError.textContent = '';
      emailInput.removeAttribute('aria-invalid');
      passwordInput.removeAttribute('aria-invalid');
    }

    function validate() {
      clearErrors();
      let firstInvalid = null;
      const email = emailInput.value.trim();

      if (!email) {
        emailError.textContent = 'Informe seu e-mail.';
        emailInput.setAttribute('aria-invalid', 'true');
        firstInvalid = firstInvalid || emailInput;
      } else if (!emailPattern.test(email)) {
        emailError.textContent = 'Digite um e-mail válido.';
        emailInput.setAttribute('aria-invalid', 'true');
        firstInvalid = firstInvalid || emailInput;
      }

      if (!passwordInput.value) {
        passwordError.textContent = 'Informe sua senha.';
        passwordInput.setAttribute('aria-invalid', 'true');
        firstInvalid = firstInvalid || passwordInput;
      }

      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    emailInput.addEventListener('input', clearErrors);
    passwordInput.addEventListener('input', function () {
      passwordError.textContent = '';
      generalError.textContent = '';
      passwordInput.removeAttribute('aria-invalid');
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!validate()) return;

      submitButton.disabled = true;
      submitLabel.textContent = 'Entrando...';
      generalError.textContent = '';

      try {
        await api.login({
          email: emailInput.value.trim(),
          password: passwordInput.value
        });
        window.location.replace('../index.html');
      } catch (error) {
        generalError.textContent = error.message || 'Não foi possível entrar. Tente novamente.';
        submitButton.disabled = false;
        submitLabel.textContent = 'Entrar';
      }
    });
  });
})();

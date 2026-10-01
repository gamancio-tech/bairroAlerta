(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const api = window.BairroAlertaAPI;
    const form = document.querySelector('#registerForm');
    const nameInput = document.querySelector('#registerName');
    const emailInput = document.querySelector('#registerEmail');
    const passwordInput = document.querySelector('#registerPassword');
    const confirmInput = document.querySelector('#registerPasswordConfirm');
    const fieldErrors = {
      name: document.querySelector('#registerNameError'),
      email: document.querySelector('#registerEmailError'),
      password: document.querySelector('#registerPasswordError'),
      confirm: document.querySelector('#registerPasswordConfirmError')
    };
    const generalError = document.querySelector('#registerError');
    const successMessage = document.querySelector('#registerSuccess');
    const submitButton = form.querySelector('[type="submit"]');
    const submitLabel = submitButton.querySelector('.auth-btn-label');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      Object.values(fieldErrors).forEach(function (element) {
        element.textContent = '';
      });
      [nameInput, emailInput, passwordInput, confirmInput].forEach(function (input) {
        input.removeAttribute('aria-invalid');
      });
      generalError.textContent = '';
    }

    function setFieldError(input, errorElement, message) {
      errorElement.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    }

    function validate() {
      clearErrors();
      let firstInvalid = null;
      const email = emailInput.value.trim();

      if (!nameInput.value.trim()) {
        setFieldError(nameInput, fieldErrors.name, 'Informe seu nome.');
        firstInvalid = firstInvalid || nameInput;
      }
      if (!email) {
        setFieldError(emailInput, fieldErrors.email, 'Informe seu e-mail.');
        firstInvalid = firstInvalid || emailInput;
      } else if (!emailPattern.test(email)) {
        setFieldError(emailInput, fieldErrors.email, 'Digite um e-mail válido.');
        firstInvalid = firstInvalid || emailInput;
      }
      if (!passwordInput.value) {
        setFieldError(passwordInput, fieldErrors.password, 'Informe uma senha.');
        firstInvalid = firstInvalid || passwordInput;
      } else if (passwordInput.value.length < 6) {
        setFieldError(passwordInput, fieldErrors.password, 'A senha deve ter pelo menos 6 caracteres.');
        firstInvalid = firstInvalid || passwordInput;
      }
      if (!confirmInput.value) {
        setFieldError(confirmInput, fieldErrors.confirm, 'Confirme sua senha.');
        firstInvalid = firstInvalid || confirmInput;
      } else if (confirmInput.value !== passwordInput.value) {
        setFieldError(confirmInput, fieldErrors.confirm, 'As senhas não coincidem.');
        firstInvalid = firstInvalid || confirmInput;
      }

      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    [nameInput, emailInput, passwordInput, confirmInput].forEach(function (input) {
      input.addEventListener('input', function () {
        const errorId = input.getAttribute('aria-describedby');
        const errorElement = errorId ? document.getElementById(errorId) : null;
        if (errorElement) errorElement.textContent = '';
        input.removeAttribute('aria-invalid');
        generalError.textContent = '';
        successMessage.textContent = '';
      });
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!validate()) return;

      submitButton.disabled = true;
      submitLabel.textContent = 'Criando conta...';
      generalError.textContent = '';
      successMessage.textContent = '';

      try {
        await api.register({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          password: passwordInput.value
        });
        successMessage.textContent = 'Conta criada com sucesso. Redirecionando para o login...';
        window.setTimeout(function () {
          window.location.replace('login.html');
        }, 1500);
      } catch (error) {
        generalError.textContent = error.message || 'Não foi possível criar a conta. Tente novamente.';
        submitButton.disabled = false;
        submitLabel.textContent = 'Criar conta';
      }
    });
  });
})();

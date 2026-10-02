// Formulário de criação, mini-mapa e preview do raio. 🔌 BACKEND: POST /api/alerts é chamado por BairroAlertaAPI.createAlert().
(function () {
  'use strict';

  const api = window.BairroAlertaAPI;
  const form = document.querySelector('#createAlertForm');
  const status = document.querySelector('#formStatus');
  const author = document.querySelector('#createAuthor');
  const typeSelect = document.querySelector('#alertType');
  const severitySelect = document.querySelector('#alertSeverity');
  const radiusInput = document.querySelector('#alertRadius');
  const radiusSlider = document.querySelector('#radiusSlider');
  const descriptionInput = document.querySelector('#alertDescription');
  const descriptionCount = document.querySelector('#descriptionCount');
  const positionMap = document.querySelector('#positionMap');
  const positionPreview = document.querySelector('#positionPreview');
  const positionPin = document.querySelector('#positionPin');
  const positionStatus = document.querySelector('#mapPositionStatus');
  const submitButton = form.querySelector('[type="submit"]');
  const submitLabel = submitButton.firstChild;
  const errorFields = {
    title: { input: document.querySelector('#alertTitle'), message: document.querySelector('#titleError') },
    type: { input: typeSelect, message: document.querySelector('#typeError') },
    severity: { input: severitySelect, message: document.querySelector('#severityError') },
    location: { input: document.querySelector('#alertLocation'), message: document.querySelector('#locationError') },
    radiusKm: { input: radiusInput, message: document.querySelector('#radiusError') },
    description: { input: descriptionInput, message: document.querySelector('#descriptionError') }
  };
  let mapX = 50;
  let mapY = 50;

  if (!api.isAuthenticated()) {
    window.location.replace('login.html?redirect=criar-alerta');
    return;
  }

  const currentUser = api.getUser();
  author.textContent = `Reportando como ${currentUser?.name || 'morador da comunidade'}`;
  author.hidden = false;

  api.ALERT_TYPES.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.value;
    option.textContent = `${type.icon} ${type.label}`;
    typeSelect.append(option);
  });

  api.SEVERITIES.forEach((severity) => {
    const option = document.createElement('option');
    option.value = severity.value;
    option.textContent = severity.label;
    severitySelect.append(option);
  });

  function updatePreview() {
    const radius = Number(radiusInput.value) || 0.1;
    const size = Math.max(24, Math.min(200, radius * 36));
    const selectedSeverity = api.SEVERITIES.find((item) => item.value === severitySelect.value) || api.SEVERITIES[1];
    positionPreview.style.width = `${size}px`;
    positionPreview.style.height = `${size}px`;
    positionPreview.style.left = `${mapX}%`;
    positionPreview.style.top = `${mapY}%`;
    positionPreview.style.setProperty('--preview-color', selectedSeverity.color);
    positionPin.style.left = `${mapX}%`;
    positionPin.style.top = `${mapY}%`;
    positionPin.style.setProperty('--preview-color', selectedSeverity.color);
  }

  function clearError(fieldName) {
    const field = errorFields[fieldName];
    field.message.textContent = '';
    field.input.removeAttribute('aria-invalid');
  }

  function validate() {
    Object.keys(errorFields).forEach(clearError);
    const errors = [];
    const radius = Number(radiusInput.value);

    if (!errorFields.title.input.value.trim()) errors.push(['title', 'Informe um título para o alerta.']);
    if (!typeSelect.value) errors.push(['type', 'Selecione o tipo da ocorrência.']);
    if (!severitySelect.value) errors.push(['severity', 'Selecione a gravidade.']);
    if (!errorFields.location.input.value.trim()) errors.push(['location', 'Informe um bairro, rua ou referência.']);
    if (!Number.isFinite(radius) || radius < 0.1 || radius > 50) errors.push(['radiusKm', 'Informe um raio entre 0,1 e 50 km.']);
    if (!descriptionInput.value.trim()) errors.push(['description', 'Descreva o que está acontecendo.']);

    errors.forEach(([fieldName, message]) => {
      errorFields[fieldName].message.textContent = message;
      errorFields[fieldName].input.setAttribute('aria-invalid', 'true');
    });
    if (errors.length) errorFields[errors[0][0]].input.focus();
    return errors.length === 0;
  }

  Object.entries(errorFields).forEach(([fieldName, field]) => {
    field.input.addEventListener('input', () => clearError(fieldName));
    field.input.addEventListener('change', () => clearError(fieldName));
  });

  radiusInput.addEventListener('input', () => {
    const value = Number(radiusInput.value);
    if (Number.isFinite(value)) radiusSlider.value = String(Math.max(0.1, Math.min(10, value)));
    updatePreview();
    clearError('radiusKm');
  });

  radiusSlider.addEventListener('input', () => {
    radiusInput.value = radiusSlider.value;
    updatePreview();
    clearError('radiusKm');
  });

  descriptionInput.addEventListener('input', () => {
    descriptionCount.textContent = `${descriptionInput.value.length}/300`;
    clearError('description');
  });

  severitySelect.addEventListener('change', updatePreview);

  positionMap.addEventListener('click', (event) => {
    const bounds = positionMap.getBoundingClientRect();
    if (event.detail === 0) {
      mapX = 50;
      mapY = 50;
    } else {
      mapX = Math.round(Math.max(8, Math.min(92, ((event.clientX - bounds.left) / bounds.width) * 100)) * 100) / 100;
      mapY = Math.round(Math.max(8, Math.min(92, ((event.clientY - bounds.top) / bounds.height) * 100)) * 100) / 100;
    }
    positionStatus.textContent = `Posição selecionada: ${mapX}% na horizontal e ${mapY}% na vertical.`;
    updatePreview();
  });

  positionMap.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 5 : 1;
    const movements = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const movement = movements[event.key];
    if (!movement) return;
    event.preventDefault();
    mapX = Math.max(8, Math.min(92, mapX + movement[0]));
    mapY = Math.max(8, Math.min(92, mapY + movement[1]));
    positionStatus.textContent = `Posição selecionada: ${mapX}% na horizontal e ${mapY}% na vertical.`;
    updatePreview();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    status.className = 'form-status';
    if (!api.isAuthenticated()) {
      window.location.replace('login.html?redirect=criar-alerta');
      return;
    }
    if (!validate()) return;

    submitButton.disabled = true;
    submitLabel.textContent = 'Publicando...';
    form.setAttribute('aria-busy', 'true');

    try {
      // 🔌 BACKEND: enviar { title, type, description, location, radiusKm, severity } via POST /api/alerts com JWT.
      await api.createAlert({
        title: errorFields.title.input.value.trim(),
        type: typeSelect.value,
        description: descriptionInput.value.trim(),
        location: errorFields.location.input.value.trim(),
        radiusKm: Number(radiusInput.value),
        severity: severitySelect.value,
        mapX,
        mapY
      });
      status.textContent = 'Alerta publicado com sucesso. Voltando ao mural...';
      status.className = 'form-status is-success';
      try {
        window.sessionStorage.setItem('bairro-alerta-active-type', 'TODOS');
      } catch {
        // O hash de destino também seleciona a aba Todos.
      }
      window.setTimeout(() => window.location.assign('../index.html#alertas'), 450);
    } catch (error) {
      status.textContent = error.message || 'Não foi possível publicar o alerta. Tente novamente.';
      status.className = 'form-status is-error';
      submitButton.disabled = false;
      submitLabel.textContent = 'Publicar alerta ';
      form.removeAttribute('aria-busy');
    }
  });

  updatePreview();
})();

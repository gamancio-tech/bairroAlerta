const storageKey = 'bairro-alerta-reports';
const form = document.querySelector('#createAlertForm');
const status = document.querySelector('#formStatus');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const radiusKm = Number(formData.get('radiusKm'));
  if (!Number.isFinite(radiusKm) || radiusKm < 0.1 || radiusKm > 50) {
    status.textContent = 'Informe um raio entre 0,1 e 50 km.';
    status.className = 'form-status is-error';
    return;
  }

  const alert = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
    title: String(formData.get('title')).trim(),
    type: String(formData.get('type')),
    severity: String(formData.get('severity')),
    location: String(formData.get('location')).trim(),
    radiusKm,
    description: String(formData.get('description')).trim(),
    createdAt: new Date().toISOString()
  };

  // BACKEND: enviar este payload para POST /api/alerts com o token JWT do usuário.
  try {
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const alerts = Array.isArray(existing) ? existing : [];
    localStorage.setItem(storageKey, JSON.stringify([alert, ...alerts]));
  } catch {
    // O payload na URL mantém a demonstração funcional se o navegador bloquear o armazenamento local.
  }

  status.textContent = 'Alerta publicado. Voltando para a lista...';
  status.className = 'form-status is-success';
  const destination = new URL('../index.html', window.location.href);
  destination.searchParams.set('newAlert', JSON.stringify(alert));
  destination.hash = 'alertas';
  window.location.assign(destination.href);
});

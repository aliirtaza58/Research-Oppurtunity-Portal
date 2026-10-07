document.getElementById('create-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  const payload = readForm(form);
  if (!payload) return;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const json = await apiRequest(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    sessionStorage.setItem('portal-notice', `Opportunity #${json.data.id} posted successfully.`);
    window.location.href = 'index.html';
  } catch (error) {
    showAlert('danger', `Could not create opportunity. ${error.message}`);
    button.disabled = false;
  }
});
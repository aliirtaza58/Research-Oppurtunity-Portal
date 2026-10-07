const id = new URLSearchParams(window.location.search).get('id');

async function loadOpportunity() {
  const loading = document.getElementById('loading');
  const form = document.getElementById('edit-form');
  try {
    if (!id) throw new Error('No opportunity ID provided.');
    const { data: op } = await apiRequest(`${API_BASE}/${encodeURIComponent(id)}`);
    document.getElementById('back-btn').href = `detail.html?id=${op.id}`;
    for (const field of ['title', 'description', 'research_area', 'faculty_name', 'department', 'required_skills', 'available_positions', 'status']) {
      document.getElementById(field).value = op[field];
    }
    document.getElementById('application_deadline').value = op.application_deadline.slice(0, 10);
    form.classList.remove('d-none');
  } catch (error) {
    showAlert('danger', `Could not load opportunity. ${error.message}`);
  } finally {
    loading.classList.add('d-none');
  }
}

document.getElementById('edit-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  const payload = readForm(form);
  if (!payload) return;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await apiRequest(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    sessionStorage.setItem('portal-notice', 'Opportunity updated successfully.');
    window.location.href = `detail.html?id=${encodeURIComponent(id)}`;
  } catch (error) {
    showAlert('danger', `Could not update opportunity. ${error.message}`);
    button.disabled = false;
  }
});

loadOpportunity();
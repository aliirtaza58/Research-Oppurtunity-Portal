const id = new URLSearchParams(window.location.search).get('id');

async function loadDetail() {
  const loading = document.getElementById('loading');
  const card = document.getElementById('detail-card');
  try {
    if (!id) throw new Error('No opportunity ID provided.');
    const { data: op } = await apiRequest(`${API_BASE}/${encodeURIComponent(id)}`);
    document.getElementById('detail-id').textContent = op.id;
    document.getElementById('detail-title').textContent = op.title;
    const badge = document.getElementById('detail-status');
    badge.textContent = op.status;
    badge.className = `badge fs-6 ${op.status === 'Open' ? 'bg-success' : 'bg-secondary'}`;
    document.getElementById('detail-faculty').textContent = op.faculty_name;
    document.getElementById('detail-department').textContent = op.department;
    document.getElementById('detail-area').textContent = op.research_area;
    document.getElementById('detail-positions').textContent = op.available_positions;
    document.getElementById('detail-deadline').textContent = formatDeadline(op.application_deadline, 'long');
    document.getElementById('detail-skills').textContent = op.required_skills;
    document.getElementById('detail-description').textContent = op.description;
    document.getElementById('edit-btn').href = `edit.html?id=${op.id}`;
    const closeButton = document.getElementById('close-btn');
    closeButton.disabled = op.status === 'Closed';
    closeButton.textContent = op.status === 'Closed' ? 'Already Closed' : 'Mark as Closed';
    card.classList.remove('d-none');
  } catch (error) {
    card.classList.add('d-none');
    showAlert('danger', `Could not load opportunity. ${error.message}`);
  } finally {
    loading.classList.add('d-none');
  }
}

document.getElementById('close-btn').addEventListener('click', async event => {
  if (!confirm('Mark this opportunity as Closed?')) return;
  const button = event.target;
  button.disabled = true;
  try {
    await apiRequest(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Closed' })
    });
    await loadDetail();
    showAlert('success', 'Opportunity marked as Closed.');
  } catch (error) {
    button.disabled = false;
    showAlert('danger', `Could not close opportunity. ${error.message}`);
  }
});

document.getElementById('delete-btn').addEventListener('click', async event => {
  if (!confirm('Are you sure you want to delete this opportunity? This cannot be undone.')) return;
  const button = event.target;
  button.disabled = true;
  try {
    await apiRequest(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    sessionStorage.setItem('portal-notice', `Opportunity #${id} deleted successfully.`);
    window.location.href = 'index.html';
  } catch (error) {
    button.disabled = false;
    showAlert('danger', `Could not delete opportunity. ${error.message}`);
  }
});

const notice = sessionStorage.getItem('portal-notice');
if (notice) {
  showAlert('success', notice);
  sessionStorage.removeItem('portal-notice');
}
loadDetail();
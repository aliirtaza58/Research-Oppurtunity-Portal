const API_BASE = 'http://localhost:5000/api/opportunities';
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function loadDetail() {
  const loading = document.getElementById('loading');
  const card = document.getElementById('detail-card');

  if (!id) {
    showAlert('danger', 'No opportunity ID provided.');
    loading.classList.add('d-none');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const json = await res.json();
    loading.classList.add('d-none');

    if (!json.success) {
      showAlert('danger', json.message || 'Opportunity not found.');
      return;
    }

    const op = json.data;
    document.getElementById('detail-title').textContent = op.title;

    const statusBadge = document.getElementById('detail-status');
    statusBadge.textContent = op.status;
    statusBadge.className = `badge fs-6 ${op.status === 'Open' ? 'bg-success' : 'bg-secondary'}`;

    document.getElementById('detail-faculty').textContent = op.faculty_name;
    document.getElementById('detail-department').textContent = op.department;
    document.getElementById('detail-area').textContent = op.research_area;
    document.getElementById('detail-positions').textContent = op.available_positions;
    document.getElementById('detail-deadline').textContent = new Date(op.application_deadline)
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('detail-skills').textContent = op.required_skills;
    document.getElementById('detail-description').textContent = op.description;

    document.getElementById('edit-btn').href = `edit.html?id=${op.id}`;

    // Hide "Mark as Closed" if already closed
    const closeBtn = document.getElementById('close-btn');
    if (op.status === 'Closed') {
      closeBtn.disabled = true;
      closeBtn.textContent = '🔒 Already Closed';
    }

    card.classList.remove('d-none');
  } catch (err) {
    loading.classList.add('d-none');
    showAlert('danger', 'Could not connect to the server.');
  }
}

document.getElementById('close-btn').addEventListener('click', async () => {
  if (!confirm('Mark this opportunity as Closed?')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Closed' })
    });
    const json = await res.json();
    if (json.success) {
      showAlert('success', 'Opportunity marked as Closed.');
      setTimeout(() => location.reload(), 1000);
    } else {
      showAlert('danger', json.message || 'Update failed.');
    }
  } catch (err) {
    showAlert('danger', 'Server error.');
  }
});

document.getElementById('delete-btn').addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete this opportunity? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      showAlert('success', 'Deleted successfully. Redirecting...');
      setTimeout(() => window.location.href = 'index.html', 1200);
    } else {
      showAlert('danger', json.message || 'Delete failed.');
    }
  } catch (err) {
    showAlert('danger', 'Server error.');
  }
});

function showAlert(type, message) {
  const box = document.getElementById('alert-box');
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
}

loadDetail();

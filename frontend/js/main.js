const API_BASE = 'http://localhost:5000/api/opportunities';

async function loadOpportunities() {
  const loading = document.getElementById('loading');
  const list = document.getElementById('opportunities-list');
  const noData = document.getElementById('no-data');

  try {
    const res = await fetch(API_BASE);
    const json = await res.json();
    loading.classList.add('d-none');

    if (!json.success || json.data.length === 0) {
      noData.classList.remove('d-none');
      return;
    }

    json.data.forEach(op => {
      const deadlineFormatted = new Date(op.application_deadline).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const statusClass = op.status === 'Open' ? 'badge-open' : 'badge-closed';

      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0">${escapeHTML(op.title)}</h6>
              <span class="badge ${statusClass} ms-2">${op.status}</span>
            </div>
            <p class="text-muted small mb-1"> ${escapeHTML(op.research_area)}</p>
            <p class="text-muted small mb-1"> ${escapeHTML(op.faculty_name)} — ${escapeHTML(op.department)}</p>
            <p class="text-muted small mb-1">Deadline: ${deadlineFormatted}</p>
            <p class="text-muted small mb-0"> Positions: ${op.available_positions}</p>
          </div>
          <div class="card-footer bg-transparent d-flex gap-2">
            <a href="detail.html?id=${op.id}" class="btn btn-sm btn-outline-primary flex-fill">View</a>
            <a href="edit.html?id=${op.id}" class="btn btn-sm btn-outline-warning flex-fill">Edit</a>
            <button onclick="deleteOpportunity(${op.id})" class="btn btn-sm btn-outline-danger flex-fill">Delete</button>
          </div>
        </div>`;
      list.appendChild(col);
    });
  } catch (err) {
    loading.classList.add('d-none');
    showAlert('danger', 'Could not connect to the server. Make sure the backend is running.');
  }
}

async function deleteOpportunity(id) {
  if (!confirm('Are you sure you want to delete this opportunity?')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      showAlert('success', 'Opportunity deleted successfully.');
      setTimeout(() => location.reload(), 1000);
    } else {
      showAlert('danger', json.message || 'Delete failed.');
    }
  } catch (err) {
    showAlert('danger', 'Server error. Could not delete.');
  }
}

function showAlert(type, message) {
  const box = document.getElementById('alert-box');
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}

loadOpportunities();

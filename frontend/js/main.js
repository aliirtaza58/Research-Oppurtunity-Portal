async function loadOpportunities() {
  const loading = document.getElementById('loading');
  const list = document.getElementById('opportunities-list');
  const noData = document.getElementById('no-data');
  loading.classList.remove('d-none');
  noData.classList.add('d-none');
  list.replaceChildren();
  try {
    const json = await apiRequest(API_BASE);
    if (json.data.length === 0) {
      noData.classList.remove('d-none');
      return;
    }
    for (const op of json.data) {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0">${escapeHTML(op.title)}</h6>
              <span class="badge ${op.status === 'Open' ? 'badge-open' : 'badge-closed'} ms-2">${escapeHTML(op.status)}</span>
            </div>
            <p class="text-muted small mb-1">${escapeHTML(op.research_area)}</p>
            <p class="text-muted small mb-1">${escapeHTML(op.faculty_name)} — ${escapeHTML(op.department)}</p>
            <p class="text-muted small mb-1">Deadline: ${formatDeadline(op.application_deadline)}</p>
            <p class="text-muted small mb-0">Positions: ${op.available_positions}</p>
          </div>
          <div class="card-footer bg-transparent d-flex gap-2">
            <a href="detail.html?id=${op.id}" class="btn btn-sm btn-outline-primary flex-fill">View</a>
            <a href="edit.html?id=${op.id}" class="btn btn-sm btn-outline-warning flex-fill">Edit</a>
            <button type="button" class="btn btn-sm btn-outline-danger flex-fill">Delete</button>
          </div>
        </div>`;
      col.querySelector('button').addEventListener('click', () => deleteOpportunity(op.id));
      list.appendChild(col);
    }
  } catch (error) {
    showAlert('danger', `Could not load opportunities. ${error.message}`);
  } finally {
    loading.classList.add('d-none');
  }
}

async function deleteOpportunity(id) {
  if (!confirm('Are you sure you want to delete this opportunity?')) return;
  try {
    await apiRequest(`${API_BASE}/${id}`, { method: 'DELETE' });
    showAlert('success', 'Opportunity deleted successfully.');
    await loadOpportunities();
  } catch (error) {
    showAlert('danger', `Could not delete opportunity. ${error.message}`);
  }
}

const notice = sessionStorage.getItem('portal-notice');
if (notice) {
  showAlert('success', notice);
  sessionStorage.removeItem('portal-notice');
}
loadOpportunities();
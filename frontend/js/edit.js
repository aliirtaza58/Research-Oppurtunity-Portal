const API_BASE = 'http://localhost:5000/api/opportunities';
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function loadOpportunity() {
  const loading = document.getElementById('loading');
  const form = document.getElementById('edit-form');

  if (!id) {
    showAlert('danger', 'No opportunity ID provided.');
    loading.classList.add('d-none');
    return;
  }

  document.getElementById('back-btn').href = `detail.html?id=${id}`;

  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const json = await res.json();
    loading.classList.add('d-none');

    if (!json.success) {
      showAlert('danger', json.message || 'Opportunity not found.');
      return;
    }

    const op = json.data;
    document.getElementById('title').value = op.title;
    document.getElementById('description').value = op.description;
    document.getElementById('research_area').value = op.research_area;
    document.getElementById('faculty_name').value = op.faculty_name;
    document.getElementById('department').value = op.department;
    document.getElementById('required_skills').value = op.required_skills;
    document.getElementById('available_positions').value = op.available_positions;
    // Format date for input[type=date]
    document.getElementById('application_deadline').value = op.application_deadline
      ? op.application_deadline.split('T')[0]
      : '';
    document.getElementById('status').value = op.status;

    form.classList.remove('d-none');
  } catch (err) {
    loading.classList.add('d-none');
    showAlert('danger', 'Could not connect to the server.');
  }
}

document.getElementById('edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const positions = parseInt(document.getElementById('available_positions').value);
  if (isNaN(positions) || positions < 1) {
    showAlert('danger', 'Available positions must be a positive number.');
    return;
  }

  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    research_area: document.getElementById('research_area').value.trim(),
    faculty_name: document.getElementById('faculty_name').value.trim(),
    department: document.getElementById('department').value.trim(),
    required_skills: document.getElementById('required_skills').value.trim(),
    available_positions: positions,
    application_deadline: document.getElementById('application_deadline').value,
    status: document.getElementById('status').value
  };

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.success) {
      showAlert('success', 'Opportunity updated successfully! Redirecting...');
      setTimeout(() => window.location.href = `detail.html?id=${id}`, 1500);
    } else {
      showAlert('danger', json.message || 'Update failed.');
    }
  } catch (err) {
    showAlert('danger', 'Could not connect to the server.');
  }
});

function showAlert(type, message) {
  const box = document.getElementById('alert-box');
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
}

loadOpportunity();

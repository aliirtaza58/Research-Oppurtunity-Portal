const API_BASE = window.location.protocol === 'file:'
  ? 'http://localhost:5000/api/opportunities'
  : `${window.location.origin}/api/opportunities`;

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(`${response.status}: ${json.message || 'Request failed'}`);
  }
  return json;
}

function showAlert(type, message) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.setAttribute('role', 'alert');
  alert.textContent = message;
  document.getElementById('alert-box').replaceChildren(alert);
}

function escapeHTML(value) {
  const div = document.createElement('div');
  div.textContent = String(value ?? '');
  return div.innerHTML;
}

function formatDeadline(value, month = 'short') {
  const date = String(value).slice(0, 10);
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric', month, year: 'numeric'
  });
}

function readForm(form) {
  for (const field of form.querySelectorAll('input[type="text"], textarea')) {
    field.value = field.value.trim();
  }
  form.classList.add('was-validated');
  if (!form.checkValidity()) {
    showAlert('danger', 'Please complete all required fields with valid values.');
    form.reportValidity();
    return null;
  }
  const positions = Number(document.getElementById('available_positions').value);
  if (!Number.isInteger(positions) || positions < 1 || positions > 2147483647) {
    showAlert('danger', 'Available positions must be a positive integer.');
    return null;
  }
  return {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    research_area: document.getElementById('research_area').value,
    faculty_name: document.getElementById('faculty_name').value,
    department: document.getElementById('department').value,
    required_skills: document.getElementById('required_skills').value,
    available_positions: positions,
    application_deadline: document.getElementById('application_deadline').value,
    status: document.getElementById('status').value
  };
}
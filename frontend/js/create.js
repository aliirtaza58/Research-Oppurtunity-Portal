const API_BASE = 'http://localhost:5000/api/opportunities';

document.getElementById('create-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  // Bootstrap validation
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
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.success) {
      showAlert('success', 'Opportunity posted successfully! Redirecting...');
      form.reset();
      form.classList.remove('was-validated');
      setTimeout(() => window.location.href = 'index.html', 1500);
    } else {
      showAlert('danger', json.message || 'Failed to create opportunity.');
    }
  } catch (err) {
    showAlert('danger', 'Could not connect to the server. Make sure the backend is running.');
  }
});

function showAlert(type, message) {
  const box = document.getElementById('alert-box');
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
}

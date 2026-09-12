const API_BASE = '/api/employees';

// Elements
const tableBody = document.getElementById('tableBody');
const loadingOverlay = document.getElementById('loadingOverlay');
const employeeModal = document.getElementById('employeeModal');
const employeeForm = document.getElementById('employeeForm');
const modalTitle = document.getElementById('modalTitle');
const addBtn = document.getElementById('addBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const compModal = document.getElementById('compModal');
const compDetails = document.getElementById('compDetails');
const closeCompModalBtn = document.getElementById('closeCompModalBtn');

// Helper to show/hide loading spinner
const showLoader = () => loadingOverlay.classList.remove('hidden');
const hideLoader = () => loadingOverlay.classList.add('hidden');

// Generic API wrapper using Promise + async/await
async function apiRequest(url, options = {}) {
  showLoader();
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    alert('An error occurred during network request.');
  } finally {
    hideLoader();
  }
}

// 1. Fetch and render all employees
async function loadEmployees() {
  const data = await apiRequest(API_BASE, { method: 'GET' });
  tableBody.innerHTML = '';

  if (Array.isArray(data) && data.length > 0) {
    data.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.name}</td>
        <td>${emp.age}</td>
        <td>${emp.mobile}</td>
        <td>${emp.city}</td>
        <td>${emp.department}</td>
        <td>$${Number(emp.salary).toLocaleString()}</td>
        <td>
          <button class="btn btn-edit" onclick="handleEdit(${emp.id})">Edit</button>
          <button class="btn btn-delete" onclick="handleDelete(${emp.id})">Delete</button>
          <button class="btn btn-info" onclick="handleCompensation(${emp.id})">Compensation</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } else {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No employees found</td></tr>`;
  }
}

// 2. Open Modal for Add
addBtn.addEventListener('click', () => {
  modalTitle.textContent = 'Add New Employee';
  employeeForm.reset();
  document.getElementById('empId').value = '';
  employeeModal.classList.remove('hidden');
});

// Close Modal
closeModalBtn.addEventListener('click', () => employeeModal.classList.add('hidden'));
closeCompModalBtn.addEventListener('click', () => compModal.classList.add('hidden'));

// 3 & 4. Handle Add or Update Form Submit
employeeForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('empId').value;
  const payload = {
    name: document.getElementById('empName').value,
    age: document.getElementById('empAge').value,
    mobile: document.getElementById('empMobile').value,
    city: document.getElementById('empCity').value,
    department: document.getElementById('empDepartment').value,
    salary: document.getElementById('empSalary').value
  };

  if (id) {
    // PUT: Update Existing Employee
    await apiRequest(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } else {
    // POST: Add New Employee
    await apiRequest(API_BASE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  employeeModal.classList.add('hidden');
  await loadEmployees();
});

// Handle Edit Button Click (GET /api/employees/:id)
window.handleEdit = async (id) => {
  const emp = await apiRequest(`${API_BASE}/${id}`, { method: 'GET' });
  if (emp) {
    modalTitle.textContent = 'Edit Employee';
    document.getElementById('empId').value = emp.id;
    document.getElementById('empName').value = emp.name;
    document.getElementById('empAge').value = emp.age;
    document.getElementById('empMobile').value = emp.mobile;
    document.getElementById('empCity').value = emp.city;
    document.getElementById('empDepartment').value = emp.department;
    document.getElementById('empSalary').value = emp.salary;
    employeeModal.classList.remove('hidden');
  }
};

// 5. Handle Delete Button Click (DELETE /api/employees/:id)
window.handleDelete = async (id) => {
  if (confirm(`Are you sure you want to delete employee with ID ${id}?`)) {
    await apiRequest(`${API_BASE}/${id}`, { method: 'DELETE' });
    await loadEmployees();
  }
};

// 6. Handle Compensation Button Click (GET /api/employees/compensation/:id)
window.handleCompensation = async (id) => {
  const data = await apiRequest(`${API_BASE}/compensation/${id}`, { method: 'GET' });
  if (data) {
    compDetails.innerHTML = `
      <p><strong>Employee:</strong> ${data.name || ('ID #' + data.id)}</p>
      <p><strong>Department:</strong> ${data.department}</p>
      <p><strong>Salary:</strong> $${Number(data.salary).toLocaleString()}</p>
    `;
    compModal.classList.remove('hidden');
  }
};

// Initial Fetch on Load
loadEmployees();
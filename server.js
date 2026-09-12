const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database Table for Employees with Auto-Increment ID
let employees = [
  { id: 1, name: 'Alice Walker', age: 29, mobile: '9876543210', city: 'New York', department: 'Engineering', salary: 75000 },
  { id: 2, name: 'Bob Smith', age: 34, mobile: '9876543211', city: 'San Francisco', department: 'Product', salary: 85000 },
  { id: 3, name: 'Charlie Kim', age: 26, mobile: '9876543212', city: 'Austin', department: 'Design', salary: 62000 }
];
let nextId = 4;

// 1. GET /api/employees - Get all employees
app.get('/api/employees', (req, res) => {
  res.status(200).json(employees);
});

// 2. GET /api/employees/:id - Get employee by ID
app.get('/api/employees/:id', (req, res) => {
  const empId = parseInt(req.params.id, 10);
  const employee = employees.find(emp => emp.id === empId);

  if (!employee) {
    return res.status(200).json({ error: 'Employee not found', employee: null });
  }

  res.status(200).json(employee);
});

// 6. GET /api/employees/compensation/:id - Compensation (Department & Salary)
// Note: Placed before dynamic /api/employees/:id or explicitly matched route
app.get('/api/employees/compensation/:id', (req, res) => {
  const empId = parseInt(req.params.id, 10);
  const employee = employees.find(emp => emp.id === empId);

  if (!employee) {
    return res.status(200).json({ error: 'Employee not found' });
  }

  res.status(200).json({
    id: employee.id,
    name: employee.name,
    department: employee.department,
    salary: employee.salary
  });
});

// 3. POST /api/employees - Add new employee
app.post('/api/employees', (req, res) => {
  const { name, age, mobile, city, department, salary } = req.body;

  const newEmployee = {
    id: nextId++,
    name: name || '',
    age: Number(age) || 0,
    mobile: mobile || '',
    city: city || '',
    department: department || '',
    salary: Number(salary) || 0
  };

  employees.push(newEmployee);
  res.status(200).json(newEmployee);
});

// 4. PUT /api/employees/:id - Update existing employee
app.put('/api/employees/:id', (req, res) => {
  const empId = parseInt(req.params.id, 10);
  const index = employees.findIndex(emp => emp.id === empId);

  if (index === -1) {
    return res.status(200).json({ error: 'Employee not found' });
  }

  const { name, age, mobile, city, department, salary } = req.body;

  employees[index] = {
    ...employees[index],
    name: name !== undefined ? name : employees[index].name,
    age: age !== undefined ? Number(age) : employees[index].age,
    mobile: mobile !== undefined ? mobile : employees[index].mobile,
    city: city !== undefined ? city : employees[index].city,
    department: department !== undefined ? department : employees[index].department,
    salary: salary !== undefined ? Number(salary) : employees[index].salary
  };

  res.status(200).json(employees[index]);
});

// 5. DELETE /api/employees/:id - Delete an employee
app.delete('/api/employees/:id', (req, res) => {
  const empId = parseInt(req.params.id, 10);
  const initialLength = employees.length;
  employees = employees.filter(emp => emp.id !== empId);

  res.status(200).json({
    success: employees.length < initialLength,
    message: `Employee with ID ${empId} deleted successfully.`
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
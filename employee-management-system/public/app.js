const employeeList = document.querySelector("#employee-list");
const employeeDialog = document.querySelector("#employee-dialog");
const employeeForm = document.querySelector("#employee-form");
const notice = document.querySelector("#notice");
const searchInput = document.querySelector("#search-input");

let employees = [];
let editingEmployeeId = null;

function showNotice(message, type = "success") {
  notice.textContent = message;
  notice.className = `notice ${type}`;
  notice.hidden = false;
  window.setTimeout(() => { notice.hidden = true; }, 4500);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "The request could not be completed.");
  return data;
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function formatSalary(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function renderEmployees() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleEmployees = employees.filter((employee) =>
    [employee.name, employee.email, employee.department, employee.designation].some((value) =>
      value.toLowerCase().includes(query)
    )
  );

  document.querySelector("#total-count").textContent = employees.length;
  document.querySelector("#nav-count").textContent = employees.length;
  document.querySelector("#results-label").textContent =
    `Showing ${visibleEmployees.length} ${visibleEmployees.length === 1 ? "employee" : "employees"}`;

  if (visibleEmployees.length === 0) {
    employeeList.innerHTML = `<tr><td class="empty-row" colspan="6">${
      employees.length ? "No employees match your search." : "No employees yet. Add your first employee to get started!"
    }</td></tr>`;
    return;
  }

  employeeList.innerHTML = visibleEmployees.map((employee) => `
    <tr>
      <td><div class="employee-person"><span class="employee-avatar">${initials(employee.name)}</span>${escapeHtml(employee.name)}</div></td>
      <td>${escapeHtml(employee.department)}</td>
      <td>${escapeHtml(employee.designation)}</td>
      <td>${escapeHtml(employee.email)}</td>
      <td>${formatSalary(employee.salary)}</td>
      <td class="row-actions">
        <button class="icon-button edit-employee" type="button" data-id="${employee._id}" aria-label="Edit ${escapeHtml(employee.name)}">Edit</button>
        <button class="icon-button delete-employee" type="button" data-id="${employee._id}" aria-label="Delete ${escapeHtml(employee.name)}">Delete</button>
      </td>
    </tr>`).join("");
}

async function loadEmployees() {
  employeeList.innerHTML = '<tr><td class="loading-row" colspan="6">Loading employees...</td></tr>';
  try {
    employees = await request("/api/employees");
    renderEmployees();
  } catch (error) {
    employeeList.innerHTML = `<tr><td class="empty-row" colspan="6">${escapeHtml(error.message)}</td></tr>`;
    showNotice(error.message, "error");
  }
}

function openEmployeeDialog(employee = null) {
  editingEmployeeId = employee?._id || null;
  employeeForm.reset();
  document.querySelector("#form-error").textContent = "";
  document.querySelector("#dialog-title").textContent = employee ? "Edit employee" : "Add an employee";
  document.querySelector("#save-button").textContent = employee ? "Save changes" : "Save employee";
  if (employee) {
    for (const field of ["name", "email", "department", "designation", "salary"]) {
      employeeForm.elements[field].value = employee[field];
    }
  }
  employeeDialog.showModal();
  employeeForm.elements.name.focus();
}

document.querySelector("#add-employee-button").addEventListener("click", () => openEmployeeDialog());
document.querySelector("#close-dialog").addEventListener("click", () => employeeDialog.close());
document.querySelector("#cancel-dialog").addEventListener("click", () => employeeDialog.close());
searchInput.addEventListener("input", renderEmployees);

employeeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const employee = Object.fromEntries(new FormData(employeeForm).entries());
  employee.salary = Number(employee.salary);
  document.querySelector("#save-button").disabled = true;
  document.querySelector("#form-error").textContent = "";

  try {
    await request(editingEmployeeId ? `/api/employees/${editingEmployeeId}` : "/api/employees", {
      method: editingEmployeeId ? "PATCH" : "POST",
      body: JSON.stringify(employee)
    });
    employeeDialog.close();
    showNotice(editingEmployeeId ? "Employee details updated." : "Employee added successfully.");
    await loadEmployees();
  } catch (error) {
    document.querySelector("#form-error").textContent = error.message;
  } finally {
    document.querySelector("#save-button").disabled = false;
  }
});

employeeList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const employee = employees.find((item) => item._id === button.dataset.id);
  if (button.classList.contains("edit-employee")) {
    openEmployeeDialog(employee);
  } else if (button.classList.contains("delete-employee") &&
      window.confirm(`Delete ${employee.name} from the employee directory?`)) {
    try {
      await request(`/api/employees/${employee._id}`, { method: "DELETE" });
      showNotice("Employee deleted successfully.");
      await loadEmployees();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }
});

loadEmployees();

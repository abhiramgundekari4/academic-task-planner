const API = "https://smart-task-manager-27w3.onrender.com/";

function getToken() {
  return localStorage.getItem("token");
}

// LOAD TASKS
async function loadTasks() {
  const token = getToken();

  const res = await fetch(`${API}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  const tasksDiv = document.getElementById("tasks");
  const assignDiv = document.getElementById("assignments");

  tasksDiv.innerHTML = "";
  assignDiv.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${item.title}</b><br>
      Priority: ${item.priority || "low"}<br>
      Due: ${item.dueDate ? item.dueDate.split("T")[0] : "N/A"}
    `;

    // COMPLETE
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = item.completed;

    check.onchange = async () => {
      await fetch(`${API}/tasks/${item._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      loadTasks();
    };

    div.appendChild(check);

    // DELETE
    const del = document.createElement("button");
    del.innerText = "Delete";

    del.onclick = async () => {
      await fetch(`${API}/tasks/${item._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      loadTasks();
    };

    div.appendChild(del);

    // TYPE FIX
    if (item.type === "assignment") {
      assignDiv.appendChild(div);
    } else {
      tasksDiv.appendChild(div);
    }
  });

  document.getElementById("stats").innerText =
    `Total Tasks: ${data.length}`;
}

// ADD
async function addTask() {
  const token = getToken();

  const title = document.getElementById("taskTitle").value;
  const type = document.getElementById("type").value;
  const priority = document.getElementById("priority").value;
  const dueDate = document.getElementById("dueDate").value;

  await fetch(`${API}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, type, priority, dueDate })
  });

  loadTasks();
}

// PROFILE
async function updateProfile() {
  const token = getToken();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  await fetch(`${API}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, email })
  });

  alert("Updated");
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "auth.html";
}

// INIT
window.onload = loadTasks;
**script.js**

```javascript
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let calendarDate = new Date();


// -------------------------
// PAGE NAVIGATION
// -------------------------

function showPage(pageId, button) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  document.getElementById(pageId).classList.add("active-page");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  }

  if (pageId === "calendar") {
    renderCalendar();
  }

  updateEverything();
}


// -------------------------
// TASK POPUP
// -------------------------

function openTaskBox() {
  document.getElementById("taskModal").classList.add("show");
  document.getElementById("taskInput").focus();
}

function closeTaskBox() {
  document.getElementById("taskModal").classList.remove("show");
}


// -------------------------
// ADD TASK
// -------------------------

function addTask() {

  const input = document.getElementById("taskInput");
  const category = document.getElementById("taskCategory");
  const date = document.getElementById("taskDate");
  const important = document.getElementById("importantInput");

  if (input.value.trim() === "") {
    alert("Please enter a task!");
    return;
  }

  const task = {
    id: Date.now(),
    name: input.value.trim(),
    category: category.value,
    date: date.value || new Date().toISOString().split("T")[0],
    important: important.checked,
    completed: false
  };

  tasks.push(task);

  saveTasks();

  input.value = "";
  date.value = "";
  important.checked = false;

  closeTaskBox();

  updateEverything();
}


// -------------------------
// CHECK TASK
// -------------------------

function toggleTask(id) {

  const task = tasks.find(task => task.id === id);

  if (task) {
    task.completed = !task.completed;
  }

  saveTasks();
  updateEverything();
}


// -------------------------
// DELETE TASK
// -------------------------

function deleteTask(id) {

  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  updateEverything();
}


// -------------------------
// FILTER TASKS
// -------------------------

function filterTasks(filter, button) {

  currentFilter = filter;

  document.querySelectorAll(".filter").forEach(btn => {
    btn.classList.remove("active");
  });

  button.classList.add("active");

  renderTasks();
}


// -------------------------
// RENDER TASKS
// -------------------------

function renderTasks() {

  const container = document.getElementById("taskList");

  let filtered = tasks;

  if (currentFilter === "active") {
    filtered = tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    filtered = tasks.filter(task => task.completed);
  }

  if (currentFilter === "important") {
    filtered = tasks.filter(task => task.important);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:35px;color:#8a91a1">
        No tasks here yet ✨
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(task => createTaskHTML(task)).join("");
}


// -------------------------
// DASHBOARD TASKS
// -------------------------

function renderDashboardTasks() {

  const container = document.getElementById("dashboardTasks");

  const today = new Date().toISOString().split("T")[0];

  const todayTasks = tasks.filter(task => task.date === today);

  if (todayTasks.length === 0) {

    container.innerHTML = `
      <div style="text-align:center;padding:25px;color:#8a91a1">
        Nothing planned for today 🎉
      </div>
    `;

    return;
  }

  container.innerHTML = todayTasks
    .slice(0, 7)
    .map(task => createTaskHTML(task))
    .join("");
}


// -------------------------
// TASK HTML
// -------------------------

function createTaskHTML(task) {

  return `
    <div class="task ${task.completed ? "completed" : ""}">

      <input
        class="task-checkbox"
        type="checkbox"
        ${task.completed ? "checked" : ""}
        onchange="toggleTask(${task.id})"
      >

      <div class="task-name">
        ${escapeHTML(task.name)}
      </div>

      <div class="task-info">
        ${escapeHTML(task.category)}
      </div>

      ${task.important ? '<span class="task-star">⭐</span>' : ""}

      <button
        class="delete-task"
        onclick="deleteTask(${task.id})"
      >
        ×
      </button>

    </div>
  `;
}


// -------------------------
// DASHBOARD STATS
// -------------------------

function updateStats() {

  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const important = tasks.filter(task => task.important).length;

  const progress = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("importantTasks").textContent = important;
  document.getElementById("progressText").textContent = progress + "%";

  document.getElementById("progressBar").style.width = progress + "%";
}


// -------------------------
// LIST COUNTS
// -------------------------

function updateLists() {

  const school = tasks.filter(task => task.category === "School").length;
  const personal = tasks.filter(task => task.category === "Personal").length;
  const important = tasks.filter(task => task.important).length;

  document.getElementById("schoolCount").textContent =
    school + (school === 1 ? " task" : " tasks");

  document.getElementById("personalCount").textContent =
    personal + (personal === 1 ? " task" : " tasks");

  document.getElementById("importantCount").textContent =
    important + (important === 1 ? " task" : " tasks");
}


// -------------------------
// CALENDAR
// -------------------------

function changeMonth(amount) {

  calendarDate.setMonth(calendarDate.getMonth() + amount);

  renderCalendar();
}


function renderCalendar() {

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthName = calendarDate.toLocaleString("default", {
    month: "long"
  });

  document.getElementById("monthYear").textContent =
    monthName + " " + year;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const container = document.getElementById("calendarDays");

  container.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    container.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {

    const dateString =
      year + "-" +
      String(month + 1).padStart(2, "0") + "-" +
      String(day).padStart(2, "0");

    const today = new Date();

    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    const dayTasks = tasks.filter(task => task.date === dateString);

    container.innerHTML += `
      <div class="${isToday ? "today" : ""}">
        <strong>${day}</strong>

        ${dayTasks.slice(0, 3).map(task => `
          <div class="calendar-task">
            ${escapeHTML(task.name)}
          </div>
        `).join("")}

      </div>
    `;
  }
}


// -------------------------
// GOALS
// -------------------------

function addGoal() {

  const name = prompt("What is your goal?");

  if (!name) return;

  const container = document.getElementById("goalsContainer");

  container.innerHTML += `
    <div class="goal-card">

      <div class="goal-top">

        <div>
          <h2>${escapeHTML(name)} 🎯</h2>
          <p>Keep working toward it!</p>
        </div>

        <span>0%</span>

      </div>

      <div class="goal-bar">
        <div style="width:0%"></div>
      </div>

      <button onclick="this.closest('.goal-card').remove()">
        Delete
      </button>

    </div>
  `;
}


// -------------------------
// NOTES
// -------------------------

function addNote() {

  const grid = document.querySelector(".notes-grid");

  const note = document.createElement("div");

  note.className = "note-card";

  note.innerHTML = `
    <input placeholder="Note title">
    <textarea placeholder="Write something..."></textarea>
  `;

  grid.appendChild(note);
}


// -------------------------
// NEW LIST
// -------------------------

function createList() {

  const name = prompt("What should your new list be called?");

  if (!name) return;

  const container = document.getElementById("listsContainer");

  const card = document.createElement("div");

  card.className = "list-card";

  card.innerHTML = `
    <div class="list-icon">📁</div>
    <h2>${escapeHTML(name)}</h2>
    <p>Your custom list</p>
    <span>0 tasks</span>
  `;

  container.appendChild(card);
}


// -------------------------
// DARK MODE
// -------------------------

function toggleDarkMode() {

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
}


// -------------------------
// SAVE
// -------------------------

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


// -------------------------
// UPDATE EVERYTHING
// -------------------------

function updateEverything() {

  updateStats();
  renderTasks();
  renderDashboardTasks();
  updateLists();

  if (
    document.getElementById("calendar").classList.contains("active-page")
  ) {
    renderCalendar();
  }
}


// -------------------------
// SECURITY
// -------------------------

function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


// -------------------------
// DATE
// -------------------------

function updateDate() {

  const now = new Date();

  document.getElementById("dateText").textContent =
    now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
}


// -------------------------
// START
// -------------------------

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

updateDate();
updateEverything();
```

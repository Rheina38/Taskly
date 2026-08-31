let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let calendarDate = new Date();

let lists = JSON.parse(localStorage.getItem("lists")) || [
  { id: 1, name: "School", icon: "🏫", description: "Homework, studying & projects" },
  { id: 2, name: "Personal", icon: "🏠", description: "Things to do at home" },
  { id: 3, name: "Important", icon: "⭐", description: "Your most important tasks" }
];

let goals = JSON.parse(localStorage.getItem("goals")) || [];

let notes = JSON.parse(localStorage.getItem("notes")) || [
  { id: 1, title: "School Notes", text: "" },
  { id: 2, title: "Ideas 💡", text: "" },
  { id: 3, title: "Things to Remember", text: "" }
];


// -------------------------
// SAVE EVERYTHING
// -------------------------

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveLists() {
  localStorage.setItem("lists", JSON.stringify(lists));
}

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}


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

  if (pageId === "lists") {
    renderLists();
  }

  if (pageId === "goals") {
    renderGoals();
  }

  if (pageId === "notes") {
    renderNotes();
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

  const taskDate = new Date(task.date + "T00:00:00");

  const formattedDate = taskDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

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

        <div class="task-info">
          📅 ${formattedDate} · ${escapeHTML(task.category)}
        </div>
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

  // Today's tasks only
  const today = new Date().toLocaleDateString("en-CA");

  const todayTasks = tasks.filter(task => task.date === today);

  const todayCompleted = todayTasks.filter(task => task.completed).length;

  const todayProgress = todayTasks.length === 0
    ? 0
    : Math.round((todayCompleted / todayTasks.length) * 100);

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("importantTasks").textContent = important;

  // This is now TODAY'S progress
  document.getElementById("progressText").textContent =
    todayProgress + "%";

  document.getElementById("progressBar").style.width =
    todayProgress + "%";
}


// -------------------------
// LISTS
// -------------------------

function renderLists() {

  const container = document.getElementById("listsContainer");

  if (lists.length === 0) {
    container.innerHTML = `
      <div style="padding:30px;color:#8a91a1">
        You don't have any lists yet. Create one! ✨
      </div>
    `;
    return;
  }

  container.innerHTML = lists.map(list => {

    // Important is a special list:
    // it shows every task marked with ⭐
    let listTasks;

    if (list.name === "Important") {
      listTasks = tasks.filter(task => task.important);
    } else {
      listTasks = tasks.filter(task => task.category === list.name);
    }

    return `
      <div class="list-card">

        <div class="list-icon">${list.icon}</div>

        <h2>${escapeHTML(list.name)}</h2>

        <p>${escapeHTML(list.description)}</p>

        <span>
          ${listTasks.length}
          ${listTasks.length === 1 ? "task" : "tasks"}
        </span>

        <div style="margin-top:18px;">

          ${
            listTasks.length === 0
              ? `
                <div style="color:#9aa1b0;font-size:14px;">
                  No tasks in this list yet ✨
                </div>
              `
              : listTasks.map(task => `
                <div
                  style="
                    display:flex;
                    align-items:center;
                    gap:8px;
                    padding:8px 0;
                    border-bottom:1px solid #edf0f5;
                  "
                >

                  <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTaskFromList(${task.id})"
                  >

                  <div style="
                    flex:1;
                    ${task.completed ? "text-decoration:line-through;color:#999;" : ""}
                  ">
                    ${escapeHTML(task.name)}

                    <div style="
                      font-size:11px;
                      color:#9299a8;
                      margin-top:2px;
                    ">
                      📅 ${formatTaskDate(task.date)}
                    </div>
                  </div>

                  ${task.important ? "⭐" : ""}

                  <button
                    onclick="deleteTaskFromList(${task.id})"
                    style="
                      background:none;
                      color:#a2a8b5;
                      font-size:18px;
                    "
                  >
                    ×
                  </button>

                </div>
              `).join("")
          }

        </div>

        ${
          list.name !== "Important"
            ? `
              <button
                onclick="openTaskBoxForList('${escapeHTML(list.name)}')"
                style="
                  margin-top:15px;
                  background:#fde8f1;
                  color:#e85d9e;
                  padding:9px 13px;
                  border-radius:8px;
                  font-weight:bold;
                "
              >
                + Add Task
              </button>
            `
            : ""
        }

        <br>

        <button
          onclick="deleteList(${list.id})"
          style="
            margin-top:12px;
            background:none;
            color:#e35d6a;
            font-weight:bold;
          "
        >
          Delete List
        </button>

      </div>
    `;

  }).join("");
}
function formatTaskDate(dateString) {

  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}


function toggleTaskFromList(id) {
  toggleTask(id);
  renderLists();
}


function deleteTaskFromList(id) {
  deleteTask(id);
  renderLists();
}


function openTaskBoxForList(listName) {

  openTaskBox();

  const category = document.getElementById("taskCategory");

  if (category) {
    category.value = listName;
  }
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

  if (!name || !name.trim()) {
    return;
  }

  const goal = {
    id: Date.now(),
    name: name.trim(),
    tasks: []
  };

  const number = prompt("How many steps/tasks should this goal have?");

  const taskCount = Number(number);

  if (Number.isNaN(taskCount) || taskCount < 1) {
    alert("Your goal needs at least 1 task.");
    return;
  }

  for (let i = 1; i <= taskCount; i++) {

    const taskName = prompt(
      `Enter goal task ${i} of ${taskCount}:`
    );

    if (taskName && taskName.trim()) {

      goal.tasks.push({
        id: Date.now() + i,
        name: taskName.trim(),
        completed: false
      });

    } else {
      i--;
    }
  }

  goals.push(goal);

  saveGoals();
  renderGoals();
}


function renderGoals() {

  const container = document.getElementById("goalsContainer");

  if (goals.length === 0) {

    container.innerHTML = `
      <div style="padding:30px;color:#8a91a1">
        No goals yet. Create your first one! 🎯
      </div>
    `;

    return;
  }

  container.innerHTML = goals.map(goal => {

    const total = goal.tasks.length;
    const completed = goal.tasks.filter(task => task.completed).length;

    const percentage = total === 0
      ? 0
      : Math.round((completed / total) * 100);

    const finished = total > 0 && completed === total;

    return `
      <div class="goal-card">

        <div class="goal-top">

          <div>
            <h2>
              ${escapeHTML(goal.name)}
              ${finished ? " ✅" : " 🎯"}
            </h2>

            <p>
              ${completed} of ${total} tasks complete
            </p>
          </div>

          <span>${percentage}%</span>

        </div>

        <div class="goal-bar">
          <div style="width:${percentage}%"></div>
        </div>

        <div style="margin-top:18px;">

          ${goal.tasks.map(goalTask => `
            <label
              style="
                display:flex;
                align-items:center;
                gap:10px;
                padding:8px 0;
              "
            >

              <input
                type="checkbox"
                ${goalTask.completed ? "checked" : ""}
                onchange="toggleGoalTask(${goal.id}, ${goalTask.id})"
              >

              <span style="${goalTask.completed ? "text-decoration:line-through;color:#999;" : ""}">
                ${escapeHTML(goalTask.name)}
              </span>

            </label>
          `).join("")}

        </div>

        <button
          onclick="finishGoal(${goal.id})"
          style="
            margin-top:12px;
            background:#5967e8;
            color:white;
            padding:9px 14px;
            border-radius:8px;
          "
          ${finished ? "disabled" : ""}
        >
          ${finished ? "Goal Finished ✓" : "Finish Goal"}
        </button>

        <button
          onclick="addGoalTask(${goal.id})"
          style="
            margin-top:12px;
            margin-left:8px;
            background:#eef0ff;
            color:#5967e8;
            padding:9px 14px;
            border-radius:8px;
          "
        >
          + Add Task
        </button>

        <br>

        <button
          onclick="deleteGoal(${goal.id})"
          style="
            margin-top:12px;
            background:none;
            color:#e35d6a;
          "
        >
          Delete Goal
        </button>

      </div>
    `;

  }).join("");
}


function toggleGoalTask(goalId, taskId) {

  const goal = goals.find(goal => goal.id === goalId);

  if (!goal) {
    return;
  }

  const task = goal.tasks.find(task => task.id === taskId);

  if (!task) {
    return;
  }

  task.completed = !task.completed;

  saveGoals();
  renderGoals();
}


function finishGoal(goalId) {

  const goal = goals.find(goal => goal.id === goalId);

  if (!goal) {
    return;
  }

  goal.tasks.forEach(task => {
    task.completed = true;
  });

  saveGoals();
  renderGoals();
}


function addGoalTask(goalId) {

  const goal = goals.find(goal => goal.id === goalId);

  if (!goal) {
    return;
  }

  const name = prompt("What task should you add to this goal?");

  if (!name || !name.trim()) {
    return;
  }

  goal.tasks.push({
    id: Date.now(),
    name: name.trim(),
    completed: false
  });

  saveGoals();
  renderGoals();
}


function deleteGoal(goalId) {

  const confirmed = confirm("Delete this goal?");

  if (!confirmed) {
    return;
  }

  goals = goals.filter(goal => goal.id !== goalId);

  saveGoals();
  renderGoals();
}


// -------------------------
// NOTES
// -------------------------

function renderNotes() {

  const grid = document.querySelector(".notes-grid");

  if (!grid) {
    return;
  }

  if (notes.length === 0) {

    grid.innerHTML = `
      <div style="padding:30px;color:#8a91a1">
        No notes yet. Add one below! 📝
      </div>
    `;

    return;
  }

  grid.innerHTML = notes.map(note => `
    <div class="note-card">

      <input
        value="${escapeHTML(note.title)}"
        oninput="updateNoteTitle(${note.id}, this.value)"
      >

      <textarea
        placeholder="Write something..."
        oninput="updateNoteText(${note.id}, this.value)"
      >${escapeHTML(note.text)}</textarea>

      <button
        onclick="deleteNote(${note.id})"
        style="
          background:none;
          color:#e35d6a;
          font-weight:bold;
        "
      >
        Delete Note
      </button>

    </div>
  `).join("");

}


function addNote() {

  notes.push({
    id: Date.now(),
    title: "New Note",
    text: ""
  });

  saveNotes();
  renderNotes();
}


function updateNoteTitle(id, value) {

  const note = notes.find(note => note.id === id);

  if (!note) {
    return;
  }

  note.title = value;

  saveNotes();
}


function updateNoteText(id, value) {

  const note = notes.find(note => note.id === id);

  if (!note) {
    return;
  }

  note.text = value;

  saveNotes();
}


function deleteNote(id) {

  const confirmed = confirm("Delete this note?");

  if (!confirmed) {
    return;
  }

  notes = notes.filter(note => note.id !== id);

  saveNotes();
  renderNotes();
}


// -------------------------
// UPDATE EVERYTHING
// -------------------------

function updateEverything() {

  updateStats();
  renderTasks();
  renderDashboardTasks();
  updateLists();

  if (document.getElementById("calendar").classList.contains("active-page")) {
    renderCalendar();
  }

  if (document.getElementById("lists").classList.contains("active-page")) {
    renderLists();
  }

  if (document.getElementById("goals").classList.contains("active-page")) {
    renderGoals();
  }

  if (document.getElementById("notes").classList.contains("active-page")) {
    renderNotes();
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

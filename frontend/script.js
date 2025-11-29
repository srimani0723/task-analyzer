const API_BASE = "http://127.0.0.1:8000/api/tasks/"; // backend.urls + tasks.urls

const form = document.getElementById("form");
const inputEl = document.getElementById("taskInput");
const resultsEl = document.getElementById("results");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const suggestBtn = document.getElementById("suggestBtn");

form.addEventListener("submit", (e) => {
  e.preventDefault();
});
analyzeBtn.addEventListener("click", analyzeTasks);
suggestBtn.addEventListener("click", suggestTasks);
clearBtn.addEventListener("click", () => {
  inputEl.value = "";
  resultsEl.innerHTML = "";
});

const testData = [
  {
    id: 1,
    title: "🔥 PRODUCTION CRASH - Users can't login",
    due_date: "2025-11-28",
    importance: 10,
    estimated_hours: 2,
    dependencies: [],
  },
  {
    id: 7,
    title: "🧪 Write unit tests (overdue)",
    due_date: "2025-11-25",
    importance: 7,
    estimated_hours: 3,
    dependencies: [],
  },
  {
    id: 1,
    title: "🔥 PRODUCTION CRASH - Users can't login",
    due_date: "2025-11-28",
    importance: 10,
    estimated_hours: 2,
    dependencies: [],
  },
  {
    id: 2,
    title: "📱 Emergency mobile fix (iOS crash)",
    due_date: "2025-11-29",
    importance: 9,
    estimated_hours: 1,
    dependencies: [1],
  },
  {
    id: 3,
    title: "⚙️ Database migration (blocks everything)",
    due_date: "2025-11-27",
    importance: 8,
    estimated_hours: 6,
    dependencies: [],
  },
  {
    id: 4,
    title: "🚀 Deploy hotfix to staging",
    due_date: "2025-11-30",
    importance: 10,
    estimated_hours: 1,
    dependencies: [1, 3],
  },
  {
    id: 5,
    title: "🎨 UI polish (quick win)",
    due_date: "2025-12-05",
    importance: 6,
    estimated_hours: 0.5,
    dependencies: [],
  },
  {
    id: 6,
    title: "📚 Write deployment docs",
    due_date: "2025-12-10",
    importance: 3,
    estimated_hours: 8,
    dependencies: [4],
  },
  {
    id: 7,
    title: "🧪 Write unit tests (overdue)",
    due_date: "2025-11-25",
    importance: 7,
    estimated_hours: 3,
    dependencies: [],
  },
  {
    id: 8,
    title: "🔒 Security audit (urgent but huge)",
    due_date: "2025-12-01",
    importance: 10,
    estimated_hours: 12,
    dependencies: [2],
  },
  {
    id: 9,
    title: "📈 Analytics dashboard",
    due_date: "2025-12-15",
    importance: 4,
    estimated_hours: 4,
    dependencies: [3, 7],
  },
  {
    id: 10,
    title: "✨ Final demo prep (CEO meeting)",
    due_date: "2025-12-03",
    importance: 9,
    estimated_hours: 2,
    dependencies: [4, 5, 8],
  },
];

inputEl.value = JSON.stringify(testData, null, 2);

async function analyzeTasks() {
  let tasks;

  try {
    tasks = JSON.parse(inputEl.value);
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error("Input must be a non‑empty JSON array of tasks.");
    }
  } catch (e) {
    showError("Invalid JSON: " + e.message);
    return;
  }

  showLoading();

  try {
    const res = await fetch(API_BASE + "analyze/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tasks),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("HTTP " + res.status + ": " + text);
    }

    const data = await res.json();
    console.log(data, "analyze");
    renderResults(data);
  } catch (e) {
    showError("Request failed: " + e.message);
  }
}

async function suggestTasks() {
  let tasks;

  try {
    tasks = JSON.parse(inputEl.value);
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error("Input must be a non‑empty JSON array of tasks.");
    }
  } catch (e) {
    showError("Invalid JSON: " + e.message);
    return;
  }

  showLoading();

  try {
    const res = await fetch(API_BASE + "suggest/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tasks),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("HTTP " + res.status + ": " + text);
    }

    const data = await res.json();
    console.log(data);
    renderResults(data.top_tasks);
  } catch (e) {
    showError("Request failed: " + e.message);
  }
}

function showLoading() {
  resultsEl.innerHTML = '<p class="loading">Analyzing tasks…</p>';
}

function showError(msg) {
  resultsEl.innerHTML = `<div class="error">${msg}</div>`;
}

function renderResults(tasks) {
  if (!tasks || tasks.length === 0) {
    resultsEl.innerHTML = '<p class="results-empty">No tasks returned.</p>';
    return;
  }

  resultsEl.innerHTML = "";

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card " + priorityClass(task.importance);

    const header = document.createElement("div");
    header.className = "task-header";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = `#${task.rank ?? "?"} ${task.title}`;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = `Score: ${task.score ?? "N/A"}`;

    header.appendChild(title);
    header.appendChild(badge);

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const parts = [];
    if (task.due_date) parts.push(`Due: ${task.due_date}`);
    if (task.importance != null) parts.push(`Importance: ${task.importance}`);
    if (task.estimated_hours != null)
      parts.push(`Est: ${task.estimated_hours}h`);
    const deps =
      task.dependencies && task.dependencies.length
        ? task.dependencies.join(", ")
        : "None";
    parts.push(`Deps: ${deps}`);

    meta.innerHTML = parts.map((t) => `<span>${t}</span>`).join("");

    card.appendChild(header);
    card.appendChild(meta);
    resultsEl.appendChild(card);
  });
}

function priorityClass(importance) {
  if (importance >= 9) return "critical";
  if (importance >= 7) return "high";
  if (importance >= 4) return "medium";
  return "low";
}

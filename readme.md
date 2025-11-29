# 🧠 Task Priority Analyzer

A small Django-based service that scores and ranks tasks by how urgently and realistically they should be done, using deadlines, importance, effort, and dependencies.

---

## 🛠 Technologies

- Python 3.13
- Django 5.2.8
- django-cors-headers 4.9.0
- HTML, CSS, Vanilla JavaScript (frontend)

---

## ✨ Features

- Paste a JSON array of tasks and get them **scored and sorted** by priority.
- Considers **urgency (due date)**, **importance**, **estimated hours**, and **dependencies** between tasks.
- Returns a **numeric score** and **rank** for each task.
- Simple frontend to visualize the prioritized list with badges and basic styling.
- CORS-enabled API so the frontend can run from a different port (e.g. Live Server on 5500).

---

## Deployed Links

> Backend : `https://task-analyzer-tx4q.onrender.com/`

> Frontend: `https://task-analyzer-jet.vercel.app/`

- When you run on the localmachine replace API_BASE in frontend/script.js with `http://127.0.0.1:8000`

---

## 📦 Project Setup (after cloning)

```bash
git clone https://github.com/srimani0723/task-analyzer.git
cd task-analyzer
```

**1. Create & activate virtualenv**

```bash
python -m venv venv
source venv/bin/activate # Linux / macOS
venv\Scripts\activate # Windows
```

**2. Install dependencies**

```bash
pip install -r requirements.txt
```

**3. Apply migrations (standard Django step)**

```bash
python manage.py makemigrations tasks
python manage.py migrate
```

`requirements.txt`:

```
Django==5.2.8
django-cors-headers==4.9.0
```

---

## ▶️ Running the project locally

**1. Start Django backend**

```
python manage.py runserver
```

- Backend runs at: **http://127.0.0.1:8000/**
- API base: **http://127.0.0.1:8000/api/tasks/**

**2. Open frontend**

Option A: Open `frontend/index.html` with a simple static server (e.g. VS Code Live Server on `http://127.0.0.1:5500`).  
Option B: Just open `frontend/index.html` directly in the browser (file://), if CORS is not an issue.

The page lets you:

- Paste JSON tasks in the textarea.
- Click **“Analyze tasks”**.
- See sorted tasks with rank and score.

---

## 🧮 API Usage

### Endpoint

POST /api/tasks/analyze/
Content-Type: application/json

### Request body

A JSON array of task objects:

```json
[
    {
        "id": 1,
        "title": "🔥 PRODUCTION CRASH - Users can't login",
        "due_date": "2025-11-28",
        "importance": 10,
        "estimated_hours": 2,
        "dependencies": []
    }
    ...
]
```

### Response (example)

```json

[
    {
        "id": 1,
        "title": "🔥 PRODUCTION CRASH - Users can't login",
        "due_date": "2025-11-28",
        "importance": 10,
        "estimated_hours": 2,
        "dependencies": [],
        "score": 175,
        "rank": 2
    },
    ...
]

```

---

## ⚙️ How the scoring algorithm works

### For each task:

`Score = Urgency + (Importance * 4) + (Effort bonus/penalty) + (Dependency bonus/penalty)`

---

## Urgency

Deadlines drive priority.

- **Overdue** → Very high points
- **Due today / very soon** → High points
- **Due later** → Fewer points

> Urgency has the biggest influence.

| Situation                       | Example days_left | Urgency score (approx) |
| ------------------------------- | ----------------- | ---------------------- |
| Very overdue (recent, 1–7 days) | −1 to −7          | 110–170                |
| Overdue but older               | < −7              | Capped around 170–200  |
| Due today / tomorrow            | 0 to 1            | 50                     |
| Due within this week            | 2–7               | 30                     |
| Due later                       | > 7               | 10                     |

---

## Importance

Impact weighting.

- Rated from **1–10**
- Multiplied by **4**

> High-importance work automatically rises to the top.

| Importance value | Score added (importance × 4) |
| ---------------- | ---------------------------- |
| 1                | 4                            |
| 3                | 12                           |
| 5                | 20                           |
| 7                | 28                           |
| 9                | 36                           |
| 10               | 40                           |

---

## Effort

Time-efficiency bias.

- **≤ 1 hour** → Bonus
- **≤ 4 hours** → Small bonus
- **Large tasks** → Small penalty

> Favors quick wins without ignoring heavy work.

| Estimated hours   | Effort adjustment |
| ----------------- | ----------------- |
| ≤ 1 hour          | +20               |
| > 1 and ≤ 4 hours | +10               |
| > 4 hours         | −5                |

---

## Dependencies

Execution readiness check.

- **No dependencies** → Bonus
- **Mostly ready** → Neutral
- **Blocked** → Penalty

> Work you can start now outranks work that’s stuck.

| Dependency situation                      | Dependency score |
| ----------------------------------------- | ---------------- |
| No dependencies                           | +15              |
| Has dependencies, all “ready”             | +10              |
| Has dependencies, at least half “ready”   | 0                |
| Has dependencies, mostly or fully blocked | −15              |

## Combined score examples (edge cases)

| Case                                            | Urgency | Importance part | Effort | Deps   | Total score (approx) |
| ----------------------------------------------- | ------- | --------------- | ------ | ------ | -------------------- |
| Overdue 4 days, imp 7, 3h, no deps              | 140     | 28              | +10    | +15    | 193                  |
| Overdue 1 day, imp 10, 2h, no deps              | 110     | 40              | +10    | +15    | 175                  |
| Overdue 2 days, imp 8, 6h, no deps              | 120     | 32              | −5     | +15    | 162                  |
| Due tomorrow, imp 9, 1h, 1 dep ready            | 50      | 36              | +20    | +10    | 116                  |
| Future (1 month), imp 6, 0.5h, no deps          | 10      | 24              | +20    | +15    | 69                   |
| Future (1 month), imp 3, 8h, blocked deps       | 10      | 12              | −5     | −15    | 2                    |
| Very old overdue (months/years), capped urgency | ~200    | varies          | varies | varies | ~220–260+            |

---

## Example with JSON input

For this task:

```json
{
  "id": 4,
  "title": "🚀 Deploy hotfix to staging",
  "due_date": "2025-11-30",
  "importance": 10,
  "estimated_hours": 1,
  "dependencies": [1, 3]
}
```

Assume today = 2025‑11‑29 and tasks 1 and 3 are overdue and “ready”.

## Score components

| Component   | Rule / Reason                                                 | Value |
| ----------- | ------------------------------------------------------------- | ----- |
| Urgency     | Due tomorrow → “very soon” bucket                             | 50    |
| Importance  | \(10 \times 4\)                                               | 40    |
| Effort      | 1 hour → quick task bonus                                     | +20   |
| Deps (with) | Deps , both ready → “all ready” bonus                         | +10   |
| Deps (none) | If this task had `dependencies: []` → “no dependencies” bonus | +15   |

## Final scores (with vs without dependencies)

| Case                        | Urgency | Importance | Effort | Dependency part   | Total score |
| --------------------------- | ------- | ---------- | ------ | ----------------- | ----------- |
| With `dependencies: [1, 3]` | 50      | 40         | +20    | +10 (all ready)   | **120**     |
| With `dependencies: []`     | 50      | 40         | +20    | +15 (independent) | **125**     |

---

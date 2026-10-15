# Project Context & Agent Memory: DevOps 30-Day Tracker

This file serves as persistent context for AI agents (Antigravity/Gemini) resuming work in this workspace.

---

## 📌 Project Overview
- **Name**: DevOps 30-Day Accelerated Tracker
- **Location**: `/home/kv/workspace/90DaysOfDevOps/tracker`
- **Curriculum Source**: `/home/kv/workspace/90DaysOfDevOps/2026` (90 daily tasks parsed into 30 accelerated days)
- **Goal**: Help the user complete the 90-day DevOps course in an accelerated 30-day timeline with real-time velocity metrics and dynamic target completion date adjustment.

---

## 🛠 System & Environment
- **Node.js**: `v24.19.0` (LTS) installed via NVM (`~/.nvm`)
- **Package Managers**: `npm v11.17.0`, `npx`
- **Skills Installed**: `frontend-design` skill in `.agents/skills/frontend-design/`
- **Global Command**: `start-tracker` installed at `/home/kv/.local/bin/start-tracker` (runs `npm start` in attached mode from any directory)

---

## 🏗 Architecture & Core Components

```
/home/kv/workspace/90DaysOfDevOps/
├── 2026/                      # Source curriculum (Days 01 - 90 markdown files)
├── scripts/
│   └── generate-tasks-data.js # Parses 2026/README.md -> tracker/src/data/tasksData.json
└── tracker/
    ├── package.json           # npm start runs "concurrently -k 'node server/index.js' 'vite'"
    ├── server/
    │   ├── index.js           # Express API server (port 3001)
    │   └── tracker.db         # SQLite database storing start_date & completed_tasks
    ├── public/2026/           # Static copy of 2026 daily markdown files for modal preview
    └── src/
        ├── App.jsx            # Dashboard, velocity banner, topic filter slider (< >), 30-day grid
        ├── components/
        │   └── TaskModal.jsx  # Styled task reader modal (Goal, Output, Guidelines, Why It Matters)
        ├── utils/
        │   └── velocityEngine.js # Calculates velocity, -X Days Saved, or +X Days Delayed
        └── data/
            └── tasksData.json # Generated dataset of 90 tasks mapped across 30 accelerated days
```

---

## 🗄 Database Schema (`tracker/server/tracker.db`)
- **`config` Table**:
  - `key` (TEXT PRIMARY KEY)
  - `value` (TEXT) - Stores `start_date` (Default: `2026-08-21`)
- **`completed_tasks` Table**:
  - `task_id` (INTEGER PRIMARY KEY)
  - `completed_at` (TEXT NOT NULL) - Stores ISO completion timestamp

### REST API Endpoints (`http://localhost:3001/api`):
- `GET  /api/state`: Returns `{ startDate, completedTasks, completionTimestamps }`
- `POST /api/start-date`: Updates `start_date`
- `POST /api/completed`: Toggles completion of a single `taskId`
- `POST /api/completed-batch`: Batch toggles completion for an accelerated day
- `POST /api/reset`: Resets all completed tasks

---

## ⚡ Velocity Calculation Logic (`velocityEngine.js`)
- **Target Pace**: 3.0 tasks/day (90 original tasks / 30 accelerated days).
- **Current Velocity ($v$)**: $\frac{\text{Completed Tasks}}{\text{Calendar Days Elapsed since Start Date}}$.
- **Dynamic Target Date**:
  - **Velocity > 3.0**: Target completion date pulls forward (`-X Days Saved!`, status: `🚀 Supercharged Pace!`).
  - **Velocity < 3.0 or Missed Days**: Target completion date extends into the future (`+X Days Delayed`, status: `🐢 Behind Schedule`).

---

## 🚀 How to Run
Run from **any directory** in your terminal:
```bash
start-tracker
```

Or from inside `tracker/`:
```bash
cd /home/kv/workspace/90DaysOfDevOps/tracker
npm start
```
- Web Application UI: `http://localhost:5173/`
- SQLite API Backend: `http://localhost:3001/`

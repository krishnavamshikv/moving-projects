# DevOps 30-Day Tracker - Persistent Session Memory

## Project Overview
- **Repository Root**: `/home/kv/workspace/90DaysOfDevOps`
- **Tracker Directory**: `/home/kv/workspace/90DaysOfDevOps/tracker`
- **Global Start Command**: `start-tracker` (available globally from any terminal via `~/.local/bin/start-tracker`)
- **Start Date Baseline**: `08/21/2026` (`2026-08-21`)
- **Git Repository**: Branch `main`, committed `5105bf0`, remote origin: `https://github.com/krishnavamshikv/accelerated-30DaysOfDevOps.git`

---

## Key Architecture & Components

1. **Express + SQLite Backend**:
   * File: `/home/kv/workspace/90DaysOfDevOps/tracker/server/index.js`
   * Database: `/home/kv/workspace/90DaysOfDevOps/tracker/server/tracker.db`
   * Serves `/2026` static files directly from workspace root.
   * Endpoints: `GET /api/state`, `POST /api/start-date`, `POST /api/completed`, `POST /api/completed-batch`, `POST /api/reset`, `POST /api/file/open-or-create`, `POST /api/file/save`.

2. **Frontend React + Vite App**:
   * Root: `/home/kv/workspace/90DaysOfDevOps/tracker/src/App.jsx`
   * Port: `5173` (Proxies `/api` and `/2026` to Express port `3001`).
   * Ignores `**/2026/**` in Vite watcher to prevent HMR browser reloads when markdown solution files are created/edited.

3. **Split-View Task Editor Studio**:
   * Component: `/home/kv/workspace/90DaysOfDevOps/tracker/src/components/TaskEditorStudio.jsx`
   * Left Pane: Task Definition & Requirements (Goal, Expected Output, Guidelines, Why This Matters).
   * Right Pane: Interactive Markdown Text Editor with line counters + rendered Preview mode.
   * Actions: **Edit/Preview Toggle**, **Clear All**, **Save File**, **Save & Complete Task**.

4. **Task Metadata & Dataset**:
   * Generator Script: `/home/kv/workspace/90DaysOfDevOps/scripts/generate-tasks-data.js`
   * JSON File: `/home/kv/workspace/90DaysOfDevOps/tracker/src/data/tasksData.json` (maps all 90 original tasks across 30 accelerated days and pre-extracts exact `expectedFilename` for every day).

---

## Useful Execution Commands
```bash
# Start Tracker Server (express + vite concurrently)
start-tracker

# Regenerate Tasks Dataset if 2026 README files are updated
node scripts/generate-tasks-data.js
```

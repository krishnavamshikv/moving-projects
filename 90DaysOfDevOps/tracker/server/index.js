import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Path definitions
const serverDir = __dirname;
const trackerDir = path.join(serverDir, '..');
const workspaceRoot = path.join(trackerDir, '..');
const dbPath = path.join(serverDir, 'tracker.db');

// Serve /2026 directory directly as static files
app.use('/2026', express.static(path.join(workspaceRoot, '2026')));

// Initialize SQLite database
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS completed_tasks (
    task_id INTEGER PRIMARY KEY,
    completed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Initialize default start date if not set (defaults to today's YYYY-MM-DD)
const initStartDate = db.prepare(`SELECT value FROM config WHERE key = 'start_date'`).get();
if (!initStartDate) {
  const defaultDate = new Date().toISOString().split('T')[0];
  db.prepare(`INSERT INTO config (key, value) VALUES ('start_date', ?)`).run(defaultDate);
}

// GET entire state
app.get('/api/state', (req, res) => {
  try {
    const startDateRow = db.prepare(`SELECT value FROM config WHERE key = 'start_date'`).get();
    const startDate = startDateRow ? startDateRow.value : new Date().toISOString().split('T')[0];

    const completedRows = db.prepare(`SELECT task_id, completed_at FROM completed_tasks`).all();
    const completedTasks = completedRows.map(row => row.task_id);
    const completionTimestamps = {};
    completedRows.forEach(row => {
      completionTimestamps[row.task_id] = row.completed_at;
    });

    res.json({
      startDate,
      completedTasks,
      completionTimestamps
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update start date
app.post('/api/start-date', (req, res) => {
  try {
    const { startDate } = req.body;
    if (!startDate) return res.status(400).json({ error: 'startDate is required' });

    db.prepare(`INSERT INTO config (key, value) VALUES ('start_date', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(startDate);
    res.json({ success: true, startDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle or update task completion
app.post('/api/completed', (req, res) => {
  try {
    const { taskId, isCompleted, completedAt } = req.body;
    if (taskId === undefined) return res.status(400).json({ error: 'taskId is required' });

    if (isCompleted) {
      const timestamp = completedAt || new Date().toISOString();
      db.prepare(`INSERT INTO completed_tasks (task_id, completed_at) VALUES (?, ?) ON CONFLICT(task_id) DO UPDATE SET completed_at = excluded.completed_at`).run(taskId, timestamp);
    } else {
      db.prepare(`DELETE FROM completed_tasks WHERE task_id = ?`).run(taskId);
    }

    res.json({ success: true, taskId, isCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch toggle accelerated day tasks
app.post('/api/completed-batch', (req, res) => {
  try {
    const { taskIds, isCompleted } = req.body;
    if (!Array.isArray(taskIds)) return res.status(400).json({ error: 'taskIds array is required' });

    const timestamp = new Date().toISOString();
    const insertStmt = db.prepare(`INSERT INTO completed_tasks (task_id, completed_at) VALUES (?, ?) ON CONFLICT(task_id) DO UPDATE SET completed_at = excluded.completed_at`);
    const deleteStmt = db.prepare(`DELETE FROM completed_tasks WHERE task_id = ?`);

    const transaction = db.transaction((ids, markCompleted) => {
      for (const id of ids) {
        if (markCompleted) {
          insertStmt.run(id, timestamp);
        } else {
          deleteStmt.run(id);
        }
      }
    });

    transaction(taskIds, isCompleted);
    res.json({ success: true, count: taskIds.length, isCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset progress
app.post('/api/reset', (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    db.prepare(`DELETE FROM completed_tasks`).run();
    db.prepare(`INSERT INTO config (key, value) VALUES ('start_date', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(todayStr);
    res.json({ success: true, startDate: todayStr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or Open `.md` file in day directory
app.post('/api/file/open-or-create', (req, res) => {
  try {
    const { relativeDir, filename, title } = req.body;
    if (!relativeDir || !filename) {
      return res.status(400).json({ error: 'relativeDir and filename are required' });
    }

    // Target path inside workspace (e.g. 2026 / day-01 / learning-plan.md)
    const targetDir = path.join(workspaceRoot, relativeDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, filename);
    const relativePath = path.join(relativeDir, filename);

    // If file doesn't exist, create starter template synchronously
    if (!fs.existsSync(filePath)) {
      const template = `# ${title || filename}\n\n## 🎯 Overview\nTask notes and implementation solution.\n\n## 📝 Execution Steps\n1. \n2. \n\n## 🔍 Verification & Logs\n\`\`\`bash\n# Paste command execution logs here\n\`\`\`\n\n## ✅ Key Learnings\n- \n`;
      fs.writeFileSync(filePath, template, 'utf-8');
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    res.json({
      success: true,
      relativePath,
      filename,
      content
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save `.md` file to disk
app.post('/api/file/save', (req, res) => {
  try {
    const { relativePath, content } = req.body;
    if (!relativePath) {
      return res.status(400).json({ error: 'relativePath is required' });
    }

    const filePath = path.join(workspaceRoot, relativePath);
    const targetDir = path.dirname(filePath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(filePath, content || '', 'utf-8');

    res.json({
      success: true,
      relativePath
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SQLite Backend Server running on http://localhost:${PORT}`);
  console.log(`💾 Database saved at: ${dbPath}`);
  console.log(`📁 Workspace root: ${workspaceRoot}`);
});

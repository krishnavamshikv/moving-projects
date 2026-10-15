import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DB_DIR = resolve(process.cwd(), 'data');
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = resolve(DB_DIR, 'scorecard.db');

// Singleton database instance across Vite HMR reloads in Node 24
let db = globalThis.__scorecard_db;

if (!db) {
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Helper for transactions (compatible with better-sqlite3 syntax)
  db.transaction = (fn) => (...args) => {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS catalog_habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      default_score TEXT CHECK(default_score IN ('+', '-', '=')) NOT NULL,
      default_duration INTEGER DEFAULT 30,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      habit_name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      score TEXT CHECK(score IN ('+', '-', '=')) NOT NULL,
      reflection_note TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
    CREATE INDEX IF NOT EXISTS idx_habit_logs_score ON habit_logs(score);
  `);

  globalThis.__scorecard_db = db;
}

export default db;

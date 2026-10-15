import db from './db.js';
import { randomUUID } from 'node:crypto';

/**
 * Calculate duration in minutes between HH:MM strings.
 * Handles overnight crossover (e.g., 23:30 to 00:30 = 60 mins).
 */
export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  if (endTotal >= startTotal) {
    return endTotal - startTotal;
  } else {
    // Crosses midnight
    return (24 * 60 - startTotal) + endTotal;
  }
}

/**
 * Format minutes into readable "Xh Ym" or "Xm" string.
 */
export function formatMinutes(mins) {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Catalog queries
export function getCatalog() {
  return db.prepare('SELECT * FROM catalog_habits ORDER BY name ASC').all();
}

export function addCatalogHabit({ name, default_score = '+', default_duration = 30, notes = '' }) {
  const id = randomUUID();
  const created_at = new Date().toISOString();
  db.prepare(`
    INSERT INTO catalog_habits (id, name, default_score, default_duration, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), default_score, Number(default_duration) || 30, notes.trim(), created_at);

  return db.prepare('SELECT * FROM catalog_habits WHERE id = ?').get(id);
}

export function deleteCatalogHabit(id) {
  db.prepare('DELETE FROM catalog_habits WHERE id = ?').run(id);
  return { success: true };
}

// Habit Log queries
export function getLogsForDate(date) {
  return db.prepare(`
    SELECT * FROM habit_logs
    WHERE date = ?
    ORDER BY start_time ASC, created_at ASC
  `).all(date);
}

export function addLog({ date, habit_name, start_time, end_time, score, reflection_note = '' }) {
  const id = randomUUID();
  const duration_minutes = calculateDuration(start_time, end_time);
  const created_at = new Date().toISOString();

  db.prepare(`
    INSERT INTO habit_logs (id, date, habit_name, start_time, end_time, duration_minutes, score, reflection_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, date, habit_name.trim(), start_time, end_time, duration_minutes, score, reflection_note.trim(), created_at);

  return db.prepare('SELECT * FROM habit_logs WHERE id = ?').get(id);
}

export function updateLog(id, { date, habit_name, start_time, end_time, score, reflection_note }) {
  const duration_minutes = calculateDuration(start_time, end_time);

  db.prepare(`
    UPDATE habit_logs
    SET date = ?, habit_name = ?, start_time = ?, end_time = ?, duration_minutes = ?, score = ?, reflection_note = ?
    WHERE id = ?
  `).run(date, habit_name.trim(), start_time, end_time, duration_minutes, score, (reflection_note || '').trim(), id);

  return db.prepare('SELECT * FROM habit_logs WHERE id = ?').get(id);
}

export function deleteLog(id) {
  db.prepare('DELETE FROM habit_logs WHERE id = ?').run(id);
  return { success: true };
}

export function copyYesterdayLogs(targetDate) {
  const target = new Date(targetDate);
  const prev = new Date(target);
  prev.setDate(target.getDate() - 1);
  const prevDateStr = prev.toISOString().split('T')[0];

  const prevLogs = getLogsForDate(prevDateStr);
  if (prevLogs.length === 0) {
    return { copiedCount: 0, message: 'No habits found from yesterday to copy.' };
  }

  const insertStmt = db.prepare(`
    INSERT INTO habit_logs (id, date, habit_name, start_time, end_time, duration_minutes, score, reflection_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  let copied = 0;
  const insertTransaction = db.transaction((logs) => {
    for (const log of logs) {
      insertStmt.run(
        randomUUID(),
        targetDate,
        log.habit_name,
        log.start_time,
        log.end_time,
        log.duration_minutes,
        log.score,
        log.reflection_note,
        now
      );
      copied++;
    }
  });

  insertTransaction(prevLogs);
  return { copiedCount: copied, message: `Copied ${copied} habits from ${prevDateStr}.` };
}

// Analytics Calculation
export function getAnalytics({ period = 'week', date }) {
  const refDate = date ? new Date(date) : new Date();
  let startDate, endDate;

  if (period === 'month') {
    startDate = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    endDate = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
  } else {
    // 'week' - Monday to Sunday
    const day = refDate.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    startDate = new Date(refDate);
    startDate.setDate(refDate.getDate() + diffToMonday);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  }

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const logs = db.prepare(`
    SELECT * FROM habit_logs
    WHERE date >= ? AND date <= ?
    ORDER BY date ASC, start_time ASC
  `).all(startStr, endStr);

  let positiveMins = 0;
  let negativeMins = 0;
  let neutralMins = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  // Track habit name aggregates
  const habitStats = {};

  for (const log of logs) {
    const mins = log.duration_minutes || 0;
    if (log.score === '+') {
      positiveMins += mins;
      positiveCount++;
    } else if (log.score === '-') {
      negativeMins += mins;
      negativeCount++;
    } else {
      neutralMins += mins;
      neutralCount++;
    }

    if (!habitStats[log.habit_name]) {
      habitStats[log.habit_name] = {
        name: log.habit_name,
        score: log.score,
        totalMinutes: 0,
        occurrences: 0,
        reflectionNotes: []
      };
    }
    habitStats[log.habit_name].totalMinutes += mins;
    habitStats[log.habit_name].occurrences += 1;
    if (log.reflection_note && !habitStats[log.habit_name].reflectionNotes.includes(log.reflection_note)) {
      habitStats[log.habit_name].reflectionNotes.push(log.reflection_note);
    }
  }

  const totalMins = positiveMins + negativeMins + neutralMins;
  const posPercent = totalMins > 0 ? Math.round((positiveMins / totalMins) * 100) : 0;
  const negPercent = totalMins > 0 ? Math.round((negativeMins / totalMins) * 100) : 0;
  const neuPercent = totalMins > 0 ? 100 - posPercent - negPercent : 0;

  // Build daily timeline series
  const dailySeries = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    const currStr = curr.toISOString().split('T')[0];
    const dayName = curr.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = curr.getDate();
    const dayLogs = logs.filter(l => l.date === currStr);

    let dayPos = 0, dayNeg = 0, dayNeu = 0;
    for (const l of dayLogs) {
      if (l.score === '+') dayPos += l.duration_minutes;
      else if (l.score === '-') dayNeg += l.duration_minutes;
      else dayNeu += l.duration_minutes;
    }

    dailySeries.push({
      date: currStr,
      label: period === 'month' ? `${dayNum}` : `${dayName} ${dayNum}`,
      fullLabel: curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      posMinutes: dayPos,
      negMinutes: dayNeg,
      neuMinutes: dayNeu,
      totalMinutes: dayPos + dayNeg + dayNeu,
      logCount: dayLogs.length
    });

    curr.setDate(curr.getDate() + 1);
  }

  // Top positive habits (ranked by time)
  const topPositive = Object.values(habitStats)
    .filter(h => h.score === '+')
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  // Top negative habits (ranked by time) - Key time drains
  const topNegative = Object.values(habitStats)
    .filter(h => h.score === '-')
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  // Neutral habits
  const topNeutral = Object.values(habitStats)
    .filter(h => h.score === '=')
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  return {
    period,
    startDate: startStr,
    endDate: endStr,
    totalMinutes: totalMins,
    totalFormatted: formatMinutes(totalMins),
    positive: {
      minutes: positiveMins,
      formatted: formatMinutes(positiveMins),
      percentage: posPercent,
      count: positiveCount
    },
    negative: {
      minutes: negativeMins,
      formatted: formatMinutes(negativeMins),
      percentage: negPercent,
      count: negativeCount
    },
    neutral: {
      minutes: neutralMins,
      formatted: formatMinutes(neutralMins),
      percentage: neuPercent,
      count: neutralCount
    },
    dailySeries,
    topPositive,
    topNegative,
    topNeutral,
    recentLogs: logs
  };
}

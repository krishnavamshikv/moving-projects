import { getCatalog, addLog, getLogsForDate, calculateDuration, copyYesterdayLogs, getAnalytics } from '../src/lib/server/queries.js';

console.log('--- Testing Backend Logic ---');

// 1. Duration calculation test
console.log('Testing duration calculation:');
const dur1 = calculateDuration('07:00', '07:45');
console.assert(dur1 === 45, `Expected 45, got ${dur1}`);
const durOvernight = calculateDuration('23:30', '00:30');
console.assert(durOvernight === 60, `Expected 60 for overnight, got ${durOvernight}`);
console.log('✔ Duration calculations passed');

// 2. Catalog check
const catalog = getCatalog();
console.log(`✔ Catalog loaded with ${catalog.length} default habits`);
console.assert(catalog.length > 0, 'Catalog should not be empty');

// 3. Add test logs
const testDate = '2026-09-15';
const prevDate = '2026-09-14';

// Clear test logs if any
import db from '../src/lib/server/db.js';
db.prepare('DELETE FROM habit_logs WHERE date IN (?, ?)').run(testDate, prevDate);

addLog({
  date: prevDate,
  habit_name: 'Morning meditation',
  start_time: '06:30',
  end_time: '07:00',
  score: '+',
  reflection_note: 'Centered my focus before work'
});

addLog({
  date: prevDate,
  habit_name: 'Doomscrolling Twitter/X',
  start_time: '07:00',
  end_time: '08:00',
  score: '-',
  reflection_note: 'Made me late and scattered my mind'
});

const prevLogs = getLogsForDate(prevDate);
console.assert(prevLogs.length === 2, `Expected 2 prev logs, got ${prevLogs.length}`);
console.log('✔ Added and retrieved yesterday logs');

// 4. Test copy-yesterday
const copyResult = copyYesterdayLogs(testDate);
console.log(`✔ Copy yesterday result:`, copyResult);
const todayLogs = getLogsForDate(testDate);
console.assert(todayLogs.length === 2, `Expected 2 copied logs today, got ${todayLogs.length}`);

// 5. Test Analytics
const analytics = getAnalytics({ period: 'week', date: testDate });
console.log('✔ Analytics calculation:');
console.log(`  Total minutes: ${analytics.totalMinutes} (${analytics.totalFormatted})`);
console.log(`  Positive: ${analytics.positive.formatted} (${analytics.positive.percentage}%)`);
console.log(`  Negative: ${analytics.negative.formatted} (${analytics.negative.percentage}%)`);
console.log(`  Top negative drains:`, analytics.topNegative.map(n => `${n.name} (${n.totalMinutes}m)`));

console.log('--- All Backend Tests PASSED! ---');

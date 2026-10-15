import db from '../src/lib/server/db.js';
import { addLog } from '../src/lib/server/queries.js';

console.log('Seeding rich demonstration data for the Habit Scorecard...');

// Clear existing demo logs to ensure clean consistent data
db.prepare('DELETE FROM habit_logs').run();

// Generate dates for current week around 2026-09-15
const sampleDays = [
  {
    offset: -3, // Saturday Sep 12
    habits: [
      { name: 'Wake up naturally', start: '08:00', end: '08:15', score: '=', note: 'Weekend wake up' },
      { name: 'Check Instagram & TikTok', start: '08:15', end: '09:15', score: '-', note: 'Wasted an hour scrolling in bed feeling sluggish' },
      { name: 'High-protein breakfast', start: '09:30', end: '10:00', score: '+', note: 'Good nutrition fuel for active weekend' },
      { name: 'Outdoor 5k trail run', start: '10:30', end: '11:15', score: '+', note: 'Boosted cardiovascular endurance and mood' },
      { name: 'Read non-fiction book', start: '14:00', end: '15:00', score: '+', note: 'Invested into lifelong learning' },
      { name: 'Late night YouTube binge', start: '22:30', end: '23:45', score: '-', note: 'Got sucked into recommendations, delayed sleep' }
    ]
  },
  {
    offset: -2, // Sunday Sep 13
    habits: [
      { name: 'Wake up & hydrate', start: '07:30', end: '07:45', score: '+', note: 'Started day intentional' },
      { name: 'Weekly planning & meal prep', start: '10:00', end: '11:30', score: '+', note: 'Prepared lunches to avoid junk food this week' },
      { name: 'Mindless Twitter arguing', start: '14:00', end: '15:15', score: '-', note: 'Spike in cortisol and frustration' },
      { name: 'Family phone call & connection', start: '17:00', end: '17:45', score: '+', note: 'Nurtured important relationships' },
      { name: 'Prepare clothes for Monday', start: '21:30', end: '21:45', score: '+', note: 'Friction reduction for morning routine' }
    ]
  },
  {
    offset: -1, // Monday Sep 14
    habits: [
      { name: 'Wake up at 6:30 AM', start: '06:30', end: '06:35', score: '+', note: 'Honored morning alarm on first ring' },
      { name: 'Brush teeth & morning hygiene', start: '06:35', end: '06:50', score: '+', note: 'Healthy self-care habit' },
      { name: 'Morning hydration (500ml)', start: '06:50', end: '06:55', score: '+', note: 'Rehydrated brain and body' },
      { name: 'Brew pour-over coffee', start: '07:00', end: '07:15', score: '=', note: 'Enjoyable morning ritual' },
      { name: 'Deep Work: Project architecture', start: '08:30', end: '10:30', score: '+', note: 'Uninterrupted creative problem solving' },
      { name: 'Afternoon doomscroll on couch', start: '14:00', end: '15:00', score: '-', note: 'Procrastinated on difficult code refactor' },
      { name: 'Strength workout at gym', start: '17:30', end: '18:45', score: '+', note: 'Hit personal record on deadlifts' },
      { name: 'Read 20 pages before bed', start: '22:00', end: '22:35', score: '+', note: 'Calm cognitive wind-down' }
    ]
  },
  {
    offset: 0, // Tuesday Sep 15 (Today)
    habits: [
      { name: 'Wake up at 6:30 AM', start: '06:30', end: '06:35', score: '+', note: 'Woke up energized and avoided snooze' },
      { name: 'Drink large glass of water', start: '06:35', end: '06:40', score: '+', note: 'Immediate hydration' },
      { name: 'Morning mobility & stretching', start: '06:45', end: '07:05', score: '+', note: 'Alleviated lower back stiffness' },
      { name: 'Brew coffee & toast', start: '07:15', end: '07:35', score: '=', note: 'Breakfast routine' },
      { name: 'Deep Work: Habit Scorecard UI', start: '08:30', end: '11:00', score: '+', note: 'Flow state progress on primary goal' },
      { name: 'Random phone browsing during slump', start: '13:30', end: '14:15', score: '-', note: 'Dopamine distraction instead of a walk' },
      { name: 'Walk in sunlight', start: '14:15', end: '14:45', score: '+', note: 'Reset mental energy and eye strain' },
      { name: 'Evening gym session', start: '18:00', end: '19:15', score: '+', note: 'Discipline and fitness consistency' },
      { name: 'Late night YouTube rabbit hole', start: '22:15', end: '23:30', score: '-', note: 'Stayed up 75 mins past sleep target' }
    ]
  }
];

const today = new Date('2026-09-15T12:00:00Z');

let totalInserted = 0;
for (const day of sampleDays) {
  const d = new Date(today);
  d.setDate(today.getDate() + day.offset);
  const dateStr = d.toISOString().split('T')[0];

  for (const h of day.habits) {
    addLog({
      date: dateStr,
      habit_name: h.name,
      start_time: h.start,
      end_time: h.end,
      score: h.score,
      reflection_note: h.note
    });
    totalInserted++;
  }
}

console.log(`✔ Successfully seeded ${totalInserted} habits across sample days!`);

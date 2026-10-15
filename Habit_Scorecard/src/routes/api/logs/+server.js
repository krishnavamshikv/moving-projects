import { json } from '@sveltejs/kit';
import { getLogsForDate, addLog } from '$lib/server/queries.js';

export async function GET({ url }) {
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
  const logs = getLogsForDate(date);
  return json({ success: true, date, logs });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { date, habit_name, start_time, end_time, score, reflection_note } = body;

    if (!date || !habit_name || !start_time || !end_time || !score) {
      return json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newLog = addLog({
      date,
      habit_name,
      start_time,
      end_time,
      score,
      reflection_note: reflection_note || ''
    });

    return json({ success: true, log: newLog }, { status: 201 });
  } catch (err) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
}

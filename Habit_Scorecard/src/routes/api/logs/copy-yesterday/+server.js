import { json } from '@sveltejs/kit';
import { copyYesterdayLogs } from '$lib/server/queries.js';

export async function POST({ request }) {
  try {
    const { targetDate } = await request.json();
    if (!targetDate) {
      return json({ success: false, error: 'targetDate is required' }, { status: 400 });
    }

    const result = copyYesterdayLogs(targetDate);
    return json({ success: true, ...result });
  } catch (err) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
}

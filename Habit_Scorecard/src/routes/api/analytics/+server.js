import { json } from '@sveltejs/kit';
import { getAnalytics } from '$lib/server/queries.js';

export async function GET({ url }) {
  const period = url.searchParams.get('period') || 'week';
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

  const analytics = getAnalytics({ period, date });
  return json({ success: true, analytics });
}

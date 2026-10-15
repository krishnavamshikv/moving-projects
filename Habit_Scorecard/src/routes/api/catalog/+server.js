import { json } from '@sveltejs/kit';
import { getCatalog, addCatalogHabit } from '$lib/server/queries.js';

export async function GET() {
  const catalog = getCatalog();
  return json({ success: true, catalog });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { name, default_score, default_duration, notes } = body;

    if (!name || !default_score) {
      return json({ success: false, error: 'Name and score are required' }, { status: 400 });
    }

    const newHabit = addCatalogHabit({ name, default_score, default_duration, notes });
    return json({ success: true, habit: newHabit }, { status: 201 });
  } catch (err) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
}

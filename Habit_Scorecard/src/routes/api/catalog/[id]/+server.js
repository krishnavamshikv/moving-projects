import { json } from '@sveltejs/kit';
import { deleteCatalogHabit } from '$lib/server/queries.js';

export async function DELETE({ params }) {
  try {
    const { id } = params;
    deleteCatalogHabit(id);
    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
}

import { json } from '@sveltejs/kit';
import { updateLog, deleteLog } from '$lib/server/queries.js';

export async function PUT({ params, request }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = updateLog(id, body);
    return json({ success: true, log: updated });
  } catch (err) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const { id } = params;
    deleteLog(id);
    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
}

import { getMaterialUnitById } from '../material-unit.remote.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		unit: await getMaterialUnitById(params.id)
	};
};

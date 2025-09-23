import { redirect } from '@sveltejs/kit';
import { getMaterialUnitById } from './material-unit.remote.js';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		unit: await getMaterialUnitById(params.id)
	};
};

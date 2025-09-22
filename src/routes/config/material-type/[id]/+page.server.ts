import { getMaterialTypeById } from '../material-type.remove.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		type: await getMaterialTypeById(params.id)
	};
};

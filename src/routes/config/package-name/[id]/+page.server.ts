import { redirect } from '@sveltejs/kit';
import { getPackageNameById } from '../package-name.remote';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		unit: await getPackageNameById(params.id)
	};
};

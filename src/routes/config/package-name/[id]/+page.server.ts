import { getPackageNameById } from '../package-name.remote';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		unit: await getPackageNameById(params.id)
	};
};

import { getUserData } from '../user-management.remote.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		token: locals.pb.authStore.token,
		model: locals.pb.authStore.model,
		id: params.id,
		userData: await getUserData()
	};
};

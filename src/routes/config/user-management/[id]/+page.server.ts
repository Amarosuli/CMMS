import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	async function getUserData() {
		return await locals.pb.collection('users').getOne(params.id);
	}

	return {
		id: params.id,
		userData: await getUserData()
	};
};

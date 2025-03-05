import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	const getUnitById = async () => {
		let id = params.id;
		if (id) return await locals.pb.collection('material_unit').getOne(id);
	};

	return {
		id: params.id,
		unit: await getUnitById()
	};
};

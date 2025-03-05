import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	const getMaterialUnit = async () => {
		const result = await locals.pb.collection('material_unit').getFullList();
		return result.map(({ id, code, description }) => {
			return { label: code + ' - ' + description, value: id };
		});
	};

	const getMaterialMasterById = async () => {
		let id = params.id;
		if (id) return await locals.pb.collection('material_master').getOne(id, { expand: 'unit_id' });
	};

	return {
		id: params.id,
		materialMaster: await getMaterialMasterById(),
		materialUnit: await getMaterialUnit()
	};
};

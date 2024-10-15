import { fail, message, superValidate } from 'sveltekit-superforms';
import { materialMasterSchema } from '$lib/zodSchema';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

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
		materialUnit: await getMaterialUnit(),
		form: await superValidate(zod(materialMasterSchema))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const form = await superValidate(request, zod(materialMasterSchema));

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, { form });

		try {
			await locals.pb.collection('material_master').update(id, form.data);
		} catch (error: any) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: error?.status });
		}

		return message(form, 'Update Successfully!');
	}
};

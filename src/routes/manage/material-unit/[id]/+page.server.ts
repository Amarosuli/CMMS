import { fail, message, superValidate } from 'sveltekit-superforms';
import { materialUnitSchema } from '$lib/zodSchema';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, url, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	const getUnitById = async () => {
		let id = params.id;
		if (id) return await locals.pb.collection('material_unit').getOne(id);
	};

	return {
		id: params.id,
		unit: await getUnitById(),
		form: await superValidate(zod(materialUnitSchema))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const form = await superValidate(request, zod(materialUnitSchema));

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, { form });

		try {
			await locals.pb.collection('material_unit').update(id, form.data);
		} catch (error: any) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: error?.status });
		}

		return message(form, 'Update Successfully!');
	}
};

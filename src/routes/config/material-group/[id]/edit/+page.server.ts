import { fail, message, superValidate } from 'sveltekit-superforms';
import { materialGroupSchema } from '$lib/zodSchema';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import type { RecordModel } from 'pocketbase';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	const getGroupById = async () => {
		let id = params.id;
		if (id) return await locals.pb.collection('material_group').getOne(id);
	};

	return {
		id: params.id,
		group: await getGroupById(),
		form: await superValidate(zod(materialGroupSchema))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const form = await superValidate(request, zod(materialGroupSchema));

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, { form });

		try {
			await locals.pb.collection('material_group').update(id, form.data);
		} catch (error: any) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: error?.status });
		}

		return message(form, 'Update Successfully!');
	}
};

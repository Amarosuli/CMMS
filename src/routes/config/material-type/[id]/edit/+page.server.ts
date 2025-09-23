import { fail, message, superValidate } from 'sveltekit-superforms';
import { getMaterialTypeById } from '../../material-type.remote.js';
import { MaterialTypeSchema } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { tryCatch } from '$lib/TryCatch';
import { valibot } from 'sveltekit-superforms/adapters';

import type { ClientResponseError } from 'pocketbase';
import type { MaterialType } from '$lib/CostumTypes.js';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		type: await getMaterialTypeById(params.id),
		form: await superValidate(valibot(MaterialTypeSchema))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const form = await superValidate(request, valibot(MaterialTypeSchema));

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, { form });

		const { error } = await tryCatch<MaterialType, ClientResponseError>(locals.pb.collection('material_type').update(id, form.data));
		if (error) {
			const errorMessage = `${error.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: 500 });
		}

		return message(form, 'Update Successfully!');
	}
};

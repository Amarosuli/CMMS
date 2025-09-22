import { fail, message, superValidate } from 'sveltekit-superforms';
import { MaterialTypeSchema } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { tryCatch } from '$lib/TryCatch';
import { valibot } from 'sveltekit-superforms/adapters';

import type { MaterialType } from '$lib/CostumTypes.js';
import type { ClientResponseError } from 'pocketbase';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		form: await superValidate(valibot(MaterialTypeSchema))
	};
};

export const actions = {
	default: async ({ locals, request }) => {
		const form = await superValidate(request, valibot(MaterialTypeSchema));

		if (!form.valid) return fail(400, { form });

		const { error } = await tryCatch<MaterialType, ClientResponseError>(locals.pb.collection('material_type').create(form.data));

		if (error) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: 500 });
		}

		return message(form, 'Create Successfully!');
	}
};

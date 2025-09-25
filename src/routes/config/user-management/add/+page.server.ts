import { fail, message, superValidate } from 'sveltekit-superforms';
import { CreateUserSchema } from '$lib/valibotSchema.js';
import { tryCatch } from '$lib/TryCatch.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

import type { ClientResponseError } from 'pocketbase';
import type { User } from '$lib/CostumTypes.js';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		token: locals.pb.authStore.token,
		model: locals.pb.authStore.model,
		form: await superValidate(valibot(CreateUserSchema))
	};
};

export const actions = {
	default: async ({ locals, request }) => {
		const form = await superValidate(request, valibot(CreateUserSchema));

		if (!form.valid) return fail(400, { form });

		const { error } = await tryCatch<User, ClientResponseError>(locals.pb.collection('users').create(form.data));

		if (error) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: 500 });
		}

		return message(form, 'Create Successfully!');
	}
};

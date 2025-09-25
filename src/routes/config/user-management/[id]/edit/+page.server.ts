import { fail, message, superValidate, type ErrorStatus } from 'sveltekit-superforms';
import { ClientResponseError } from 'pocketbase';
import { UpdateUserSchema } from '$lib/valibotSchema.js';
import { getUserData } from '../../user-management.remote.js';
import { tryCatch } from '$lib/TryCatch.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';
import { User } from '@lucide/svelte';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		userData: await getUserData(),
		form: await superValidate(valibot(UpdateUserSchema))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const form = await superValidate(request, valibot(UpdateUserSchema));

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, { form });

		const { error } = await tryCatch<User, ClientResponseError>(locals.pb.collection('users').update(id, form.data));

		if (error) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: error?.status as ErrorStatus });
		}

		return message(form, 'Update Successfully!');
	}
};

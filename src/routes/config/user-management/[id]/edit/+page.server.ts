import { fail, message, superValidate } from 'sveltekit-superforms';
import { userSchema } from '$lib/zodSchema';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	async function getUserData() {
		return await locals.pb.collection('users').getOne(params.id);
	}

	return {
		id: params.id,
		userData: await getUserData(),
		form: await superValidate(zod(userSchema.omit({ password: true, passwordConfirm: true })))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const form = await superValidate(request, zod(userSchema.omit({ password: true, passwordConfirm: true })));

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, { form });

		try {
			await locals.pb.collection('users').update(id, form.data);
		} catch (error: any) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: error?.status });
		}

		return message(form, 'Create Successfully!');
	}
};

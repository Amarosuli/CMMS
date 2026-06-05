import { fail, message, superValidate } from 'sveltekit-superforms';
import { StockOutSchema } from '$lib/valibotSchema.js';
import { tryCatch } from '$lib/TryCatch.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		form: await superValidate(valibot(StockOutSchema))
	};
};
export const actions = {
	save: async ({ locals, request }) => {
		const form = await superValidate(request, valibot(StockOutSchema));

		if (!form.valid) return fail(400, { form });

		const { data, error } = await tryCatch(locals.pb.collection('stock_out').create(form.data));

		if (error) {
			const errorMessage = `${error?.message} | PocketBase error (Stock Out)`;
			return message(form, errorMessage, { status: 500 });
		}

		return message(form, { text: 'Create Stock Out Successfully!', result: data });
	}
};

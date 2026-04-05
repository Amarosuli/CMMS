import { fail, message, superValidate } from 'sveltekit-superforms';
import { StockOutSchema } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

import type { RecordModel } from 'pocketbase';

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

		let result: RecordModel;
		try {
			result = await locals.pb.collection('stock_out').create(form.data);
		} catch (er: any) {
			const errorMessage = `${er?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: er?.status });
		}

		return message(form, { text: 'Create Stock Out Successfully!', result });
	}
};

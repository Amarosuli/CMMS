import { fail, message, superValidate } from 'sveltekit-superforms';
import { createStockOut } from '$lib/remote-function/stock.remote.js';
import { StockOutSchema } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

import { type StockOut } from '$lib/CostumTypes.js';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		form: await superValidate(valibot(StockOutSchema))
	};
};
export const actions = {
	save: async ({ request }) => {
		const form = await superValidate(request, valibot(StockOutSchema));

		if (!form.valid) return fail(400, { form });

		const { status, message: errorMessage, data } = await createStockOut(form.data);

		if (status === 'failed') {
			// logger error?.response?.data
			return message(form, `${errorMessage} | PocketBase error (Stock Out)`, { status: 500 });
		}

		const stockOutResult = data?.[0].body as StockOut;
		return message(form, { text: 'Create Stock Out Successfully!', stockOutResult });
	}
};

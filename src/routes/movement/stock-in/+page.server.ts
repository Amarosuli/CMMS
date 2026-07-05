import { fail, message, superValidate } from 'sveltekit-superforms';
import { GetMaterialMasterOption } from '$lib/remote-function/movement.remote';
import { getPackageNameOption } from '../../config/material-master/material-master.remote.js';
import { createStockIn } from '$lib/remote-function/stock.remote.js';
import { StockInSchema } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

import { type StockIn } from '$lib/CostumTypes.js';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		packageNameOption: await getPackageNameOption(),
		materialMasterOption: await GetMaterialMasterOption(),
		form: await superValidate(valibot(StockInSchema))
	};
};
export const actions = {
	save: async ({ request }) => {
		const form = await superValidate(request, valibot(StockInSchema));

		if (!form.valid) return fail(400, { form });

		const { status, message: errorMessage, data } = await createStockIn(form.data);

		if (status === 'failed') {
			// logger error?.response?.data
			return message(form, `${errorMessage} | PocketBase error (Stock In)`, { status: 500 });
		}

		// NOTE: The process of creating stock item handled by PocketBase hook, so no need to create them here.
		// The hooks are 'create_stock_item_after_stock_master'.

		const stockInResult = data?.[0].body as StockIn;
		return message(form, { text: 'Stock In created successfully!', stockInResult });
	}
};

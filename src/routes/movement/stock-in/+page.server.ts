import { fail, message, superValidate } from 'sveltekit-superforms';
import { GetMaterialMasterOption } from '../movement.remote.js';
import { getPackageNameOption } from '../../config/material-master/material-master.remote.js';
import { StockInSchema } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

import type { RecordModel } from 'pocketbase';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		packageNameOption: await getPackageNameOption(),
		materialMasterOption: await GetMaterialMasterOption(),
		form: await superValidate(valibot(StockInSchema))
	};
};
export const actions = {
	save: async ({ locals, request }) => {
		const form = await superValidate(request, valibot(StockInSchema));

		if (!form.valid) return fail(400, { form });

		let result: RecordModel;
		try {
			result = await locals.pb.collection('stock_in').create(form.data);
		} catch (er: any) {
			const errorMessage = `${er?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: er?.status });
		}

		// NOTE: The process of creating stock master and stock item handled by PocketBase hook, so no need to create them here.
		// The hooks are 'create_stock_master_after_stock_in' and 'create_stock_item_after_stock_master'.

		return message(form, { text: 'Create Stock In Successfully!', result });
	}
};

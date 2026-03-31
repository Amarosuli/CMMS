import { GetMaterialMasterOption } from '../movement.remote.js';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { StockInSchema } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

import type { RecordModel } from 'pocketbase';
import { getPackageNameOption } from '../../config/material-master/material-master.remote.js';

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

		return message(form, { text: 'Create Stock In Successfully!', result });
	},
	saveToStockMaster: async ({ locals, request }) => {
		const form = await request.formData();

		try {
			await locals.pb.collection('stock_master').create(form);
		} catch (er: any) {
			const errorMessage = `${er?.response.message} | PocketBase error.`;
			return fail(er?.status, { message: errorMessage });
		}

		return JSON.stringify({ message: 'Save to Stock Master Successfully' });
	}
};

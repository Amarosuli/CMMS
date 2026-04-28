import { fail, message, superValidate } from 'sveltekit-superforms';
import { GetMaterialMasterOption } from '../movement.remote.js';
import { getPackageNameOption } from '../../config/material-master/material-master.remote.js';
import { customAlphabet } from 'nanoid';
import { StockInSchema } from '$lib/valibotSchema.js';
import { tryCatch } from '$lib/TryCatch.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

import { StockMasterStatus, type StockIn } from '$lib/CostumTypes.js';

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

		// generate id
		const stockInId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 15)();

		const batch = locals.pb.createBatch();

		batch.collection('stock_in').create({ ...form.data, id: stockInId });
		batch.collection('stock_master').create({
			...form.data,
			status: StockMasterStatus.ACTIVE,
			stock_in_id: stockInId,
			quantity_available: form.data.quantity
		});

		const { data, error } = await tryCatch(batch.send());

		if (error) {
			const errorMessage = `${error?.message} | PocketBase error (Stock In)`;
			return message(form, errorMessage, { status: 500 });
		}

		// NOTE: The process of creating stock item handled by PocketBase hook, so no need to create them here.
		// The hooks are 'create_stock_item_after_stock_master'.

		const stockInResult = data?.[0].body as StockIn;
		return message(form, { text: 'Stock In created successfully!', stockInResult });
	}
};

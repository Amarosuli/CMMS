import { fail, message, superValidate } from 'sveltekit-superforms';
import { StockOutSchema } from '$lib/valibotSchema.js';
import { tryCatch } from '$lib/TryCatch.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

import { StockItemStatus, StockMasterStatus, type StockOut } from '$lib/CostumTypes.js';

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

		const stockItemId = form.data.stock_item_id;
		const stockItem = await tryCatch(locals.pb.collection('stock_item').getOne(stockItemId, { expand: 'stock_master_id' }));

		const batch = locals.pb.createBatch();

		if (stockItem.status === 'success') {
			const stockMasterId = stockItem.data.expand?.stock_master_id.id;
			const qtyAvailable = stockItem.data.expand?.stock_master_id.quantity_available;

			if (qtyAvailable < form.data.quantity) {
				return message(form, { text: `Error, quantity available in stock master ${qtyAvailable} is less than stock out quantity ${form.data.quantity}` });
			}

			const finalQty = qtyAvailable - form.data.quantity;
			console.log(finalQty, qtyAvailable, '-', form.data.quantity);
			if (finalQty === 0) {
				batch.collection('stock_master').update(stockMasterId, { quantity_available: finalQty, status: StockMasterStatus.INACTIVE });
			} else {
				batch.collection('stock_master').update(stockMasterId, { quantity_available: finalQty });
			}
		} else {
			batch.client.cancelAllRequests();
			return message(form, { text: 'Error, Stock item or stock master not found' });
		}

		batch.collection('stock_out').create(form.data);
		batch.collection('stock_item').update(form.data.stock_item_id, { status: StockItemStatus.DISPOSED, isBorrowed: false });

		const { data, error } = await tryCatch(batch.send());

		if (error) {
			// logger error?.response?.data
			const errorMessage = `${error?.message} | PocketBase error (Stock Out)`;
			return message(form, errorMessage, { status: 500 });
		}

		const stockOutResult = data?.[0].body as StockOut;
		return message(form, { text: 'Create Stock Out Successfully!', stockOutResult });
	}
};

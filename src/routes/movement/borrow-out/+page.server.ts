import { borrowingSchema, borrowItemOutSchema } from '$lib/zodSchema';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import type { RecordModel } from 'pocketbase';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		formBorrowing: await superValidate(zod(borrowingSchema)),
		formItem: await superValidate(zod(borrowItemOutSchema))
	};
};
export const actions = {
	createBorrowing: async ({ locals, request }) => {
		const form = await superValidate(request, zod(borrowingSchema));

		if (!form.valid) return fail(400, { form });

		let result: RecordModel;
		try {
			result = await locals.pb.collection('borrow_movement').create(form.data);
		} catch (er: any) {
			const errorMessage = `${er?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: er?.status });
		}

		return message(form, { text: 'Create Borrowing Successfully!', result });
	},
	addItemBorrowing: async ({ locals, request }) => {
		const form = await superValidate(request, zod(borrowItemOutSchema));

		if (!form.valid) return fail(400, { form });

		let result: RecordModel[] = [];
		for (let index = 0; index < form.data.items.length; index++) {
			const item = form.data.items[index];

			try {
				const stock = await locals.pb.collection('stock_master').getOne(item.stock_id);
				await locals.pb.collection('stock_master').update(item.stock_id, { ...stock, quantity_borrowed: stock.quantity_borrowed + item.quantity_out });
				result[index] = await locals.pb.collection('borrow_item').create(item);
			} catch (er: any) {
				const errorMessage = `${er?.response.message} | PocketBase error.`;
				return fail(er?.status, { message: errorMessage });
			}
		}

		return message(form, { text: 'Borrow Item Successfully Created', result });
	}
};

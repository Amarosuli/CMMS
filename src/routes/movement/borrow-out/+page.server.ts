import { fail, message, superValidate } from 'sveltekit-superforms';
import { borrowingSchema, borrowItemOutSchema } from '$lib/zodSchema';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import type { RecordModel } from 'pocketbase';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	const getStock = async () => {
		const result = await locals.pb.collection('stock_master').getFullList({ expand: 'material_id,material_id.unit_id,stock_in_id' });
		return result.map(({ id, batch_number, expand, quantity_available }) => {
			return {
				value: id,
				quantity_available,
				label: batch_number + ' - ' + expand?.material_id.code,
				detail: expand?.material_id.code + ' - ' + expand?.material_id.part_number,
				unit: expand?.material_id.expand?.unit_id.code || ''
			};
		});
	};

	return {
		stock: await getStock(),
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
				result[index] = await locals.pb.collection('borrow_item').create(item);
			} catch (er: any) {
				const errorMessage = `${er?.response.message} | PocketBase error.`;
				return fail(er?.status, { message: errorMessage });
			}
		}

		return message(form, { text: 'Borrow Item Successfully Created', result });
	}
};

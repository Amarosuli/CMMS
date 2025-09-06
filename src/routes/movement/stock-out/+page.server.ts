import { fail, message, superValidate } from 'sveltekit-superforms';
import { stockOutSchema } from '$lib/zodSchema';
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
				detail: expand?.material_id.code + ' - ' + expand?.material_id.part_number + ' - ' + expand?.material_id.description,
				unit: expand?.material_id.expand?.unit_id.code || ''
			};
		});
	};

	const getTransactionType = async () => {
		const result = await locals.pb.collection('transaction_type').getFullList();
		return result.map(({ id, code, description }) => {
			return { label: code, value: id, description };
		});
	};

	return {
		transactionType: await getTransactionType(),
		stock: await getStock(),
		form: await superValidate(zod(stockOutSchema))
	};
};
export const actions = {
	save: async ({ locals, request }) => {
		const form = await superValidate(request, zod(stockOutSchema));

		if (!form.valid) return fail(400, { form });

		let result: RecordModel;
		try {
			result = await locals.pb.collection('stock_out').create(form.data);
		} catch (er: any) {
			const errorMessage = `${er?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: er?.status });
		}

		return message(form, { text: 'Create Stock Out Successfully!', result });
	},
	updateToStockMaster: async ({ locals, request }) => {
		const form = await request.formData();
		const id = form.get('stock_id')?.toString();
		const quantity = form.get('quantity')?.toString();

		if (!id) return fail(400, { message: 'No id provided' });

		try {
			const stock = await locals.pb.collection('stock_master').getOne(id);

			let quantity_remain = stock.quantity_available - Number(quantity);
			let isQuantityZero = quantity_remain === 0;

			if (Math.sign(quantity_remain) === -1) {
				return fail(401, {
					message: 'Stock out quantity is over the available quantity.'
				});
			} else if (isQuantityZero) {
				await locals.pb.collection('stock_master').update(id, {
					quantity_available: quantity_remain,
					status: 'INACTIVE'
				});
			} else {
				await locals.pb.collection('stock_master').update(id, {
					quantity_available: quantity_remain
				});
			}
		} catch (er: any) {
			const errorMessage = `${er?.response.message} | PocketBase error.`;
			return fail(er?.status, { message: errorMessage });
		}

		return JSON.stringify({ message: 'Update to Stock Master Successfully' });
	}
};

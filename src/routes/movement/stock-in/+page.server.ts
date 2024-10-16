import { fail, message, superValidate } from 'sveltekit-superforms';
import { stockInSchema } from '$lib/zodSchema';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import type { RecordModel } from 'pocketbase';

export const load = async ({ locals, url, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	const getMaterialMaster = async () => {
		const result = await locals.pb.collection('material_master').getFullList();
		return result.map(({ id, code, description, part_number }) => {
			return { label: code, value: id, detail: code + ' - ' + part_number + ' - ' + description };
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
		materialMaster: await getMaterialMaster(),
		form: await superValidate(zod(stockInSchema))
	};
};
export const actions = {
	save: async ({ locals, request }) => {
		const form = await superValidate(request, zod(stockInSchema));

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
		console.log(form);
		try {
			await locals.pb.collection('stock_master').create(form);
		} catch (er: any) {
			const errorMessage = `${er?.response.message} | PocketBase error.`;
			return fail(er?.status, { message: errorMessage });
		}

		return JSON.stringify({ message: 'Save to Stock Master Successfully' });
	},
	delete: async ({ locals, request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		if (!id) return fail(401, { message: 'No id provided' });

		try {
			await locals.pb.collection('stock_in').delete(id);
		} catch (er: any) {
			const errorMessage = `${er?.response.message} | PocketBase error.`;
			return fail(er?.status, { message: errorMessage });
		}

		return { message: 'Delete success' };
	}
};

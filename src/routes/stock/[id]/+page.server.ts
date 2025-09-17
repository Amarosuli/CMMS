import { fail, message, superValidate } from 'sveltekit-superforms';
import { stockInSchema } from '$lib/zodSchema';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { tryCatch } from '$lib/TryCatch';
import type { StockMaster } from '$lib/CostumTypes.js';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	const getMaterialMaster = async () => {
		const result = await locals.pb.collection('material_master').getFullList();
		return result.map(({ id, code, description }) => {
			return { label: code + ' - ' + description, value: id };
		});
	};

	const getStockMasterById = async () => {
		let id = params.id;
		if (id) {
			const { status, data } = await tryCatch(locals.pb.collection('stock_master').getOne(id, { expand: 'material_id.unit_id' }));
			return data;
		} else {
			return {} as StockMaster;
		}
	};

	return {
		id: params.id,
		stockMaster: await getStockMasterById(),
		materialMaster: await getMaterialMaster(),
		form: await superValidate(zod(stockInSchema))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const form = await superValidate(request, zod(stockInSchema));

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, { form });

		try {
			await locals.pb.collection('material_master').update(id, form.data);
		} catch (error: any) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: error?.status });
		}

		return message(form, 'Update Successfully!');
	}
};

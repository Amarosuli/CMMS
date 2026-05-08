import { getStockByMaterialMasterId } from '../stock.remote.js';
import { StockInSchema } from '$lib/valibotSchema.js';
import { superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		allStock: await getStockByMaterialMasterId(params.id),
		form: await superValidate(valibot(StockInSchema))
	};
};

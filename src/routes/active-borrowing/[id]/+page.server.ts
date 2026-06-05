import type { BorrowItem, BorrowMovement } from '$lib/CostumTypes.js';
import { MaterialMasterSchema } from '$lib/valibotSchema';
import { superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	const getBorrowingById = async () => {
		const id = params.id;
		if (!id) return {} as BorrowMovement;
		const result = await locals.pb.collection('borrow_movement').getOne(id, {
			expand: 'user_id'
		});

		return { ...result, user: result.expand?.user_id || {} };
	};

	const getBorrowItemById = async () => {
		const id = params.id;
		if (!id) return [] as BorrowItem[];
		const result = await locals.pb.collection('borrow_item').getFullList({
			filter: 'borrow_movement_id="' + id + '"',
			expand: 'stock_item_id.stock_master_id.material_master_id.material_unit_id'
		});
		return result.map((res) => {
			return { ...res, stock: res.expand?.stock_item_id || {}, material: res.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id || {} };
		});
	};

	return {
		id: params.id,
		borrowItems: await getBorrowItemById(),
		borrowData: await getBorrowingById(),
		form: await superValidate(valibot(MaterialMasterSchema))
	};
};

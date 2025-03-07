import type { BorrowItem, BorrowMovement } from '$lib/CostumTypes.js';
import { materialMasterSchema } from '$lib/zodSchema';
import { superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, url, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	const getBorrowingById = async () => {
		let id = params.id;
		if (!id) return {} as BorrowMovement;
		const result = await locals.pb.collection('borrow_movement').getOne(id, {
			expand: 'user_id'
		});

		return { ...result, user: result.expand?.user_id || {} };
	};

	const getBorrowItemById = async () => {
		let id = params.id;
		if (!id) return [] as BorrowItem[];
		const result = await locals.pb.collection('borrow_item').getFullList({
			filter: 'borrow_id="' + id + '"',
			expand: 'stock_id.material_id.unit_id'
		});
		return result.map((res) => {
			return { ...res, stock: res.expand?.stock_id || {}, material: res.expand?.stock_id.expand?.material_id || {} };
		});
	};

	return {
		id: params.id,
		borrowItems: await getBorrowItemById(),
		borrowData: await getBorrowingById(),
		form: await superValidate(zod(materialMasterSchema))
	};
};

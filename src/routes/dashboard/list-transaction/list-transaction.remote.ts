import { BorrowMovementStatus, type BorrowItem } from '$lib/CostumTypes';
import { getRequestEvent, query } from '$app/server';
import { optional, enum_ } from 'valibot';
import { tryCatch } from '$lib/TryCatch';
import { string } from 'zod';

export const getActiveBorrowing = query(optional(enum_(BorrowMovementStatus)), async (borrowMovementStatus) => {
	const { locals } = getRequestEvent();
	let filter = '';
	if (borrowMovementStatus) {
		filter = `'status = "${borrowMovementStatus}"'`;
	} else {
		filter = 'status = "OPEN"';
	}
	const { data, error } = await tryCatch(locals.pb.collection('borrow_movement').getFullList({ filter: filter, expand: 'user_id' }));

	if (error) {
		return null;
	}

	if (data) {
		return data;
	} else {
		return null;
	}
});

export const getItemFromActiveBorrowing = query(string(), async (borrowMovementId) => {
	const { locals } = getRequestEvent();
	const { data, error } = await tryCatch(locals.pb.collection('borrow_item').getFullList({ filter: 'borrow_movement_id = "' + borrowMovementId + '"', expand: 'stock_item_id.stock_master_id.material_master_id.material_unit_id' }));

	if (error) {
		return [] as BorrowItem[];
	}

	if (data) {
		return data;
	} else {
		return [] as BorrowItem[];
	}
});

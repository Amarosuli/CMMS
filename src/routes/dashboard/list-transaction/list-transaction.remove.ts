import { getRequestEvent, query } from '$app/server';
import { BorrowStatus, type BorrowItem } from '$lib/CostumTypes';
import { tryCatch } from '$lib/TryCatch';
import { toast } from 'svelte-sonner';
import { array, nativeEnum, number, object, string } from 'zod';

export const getActiveBorrowing = query(string(), async () => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('borrow_movement').getList(1, 20, { filter: 'status = "OPEN"', expand: 'user_id' }));

	return { status, data };
});

export const getItemFromActiveBorrowing = query(string(), async (borrowId) => {
	const { locals } = getRequestEvent();
	const { status, data } = await tryCatch(locals.pb.collection('borrow_item').getFullList({ filter: 'borrow_id = "' + borrowId + '"' }));
	// locals.pb.collection('borrow_item').getList(1, 20, {filter: 'borrow_id.status = "OPEN"'})
	return { status, data };
});

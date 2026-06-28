import { getRequestEvent, query } from '$app/server';
import { tryCatch } from '$lib/TryCatch';
import type { BorrowMovement } from '$lib/CostumTypes';
import type { ListResult } from 'pocketbase';

export const getTotalBorrowingToday = query(async () => {
	const { locals } = getRequestEvent();

	const filter = 'created >= @todayStart';

	const { status, data, error } = await tryCatch(locals.pb.collection('borrow_movement').getList(1, 50, { filter, expand: 'user_id' }));

	if (status === 'failed') {
		return { status, message: error.message, data: {} as ListResult<BorrowMovement> };
	} else {
		return { status, message: 'Get total borrowed today success', data };
	}
});

import { getRequestEvent, query } from '$app/server';
import { tryCatch } from '$lib/TryCatch';
import { toast } from 'svelte-sonner';

export const getOpenBorrowings = query(async () => {
	const { locals } = getRequestEvent();

	const { data, error } = await tryCatch(locals.pb.collection('borrow_movement').getFullList({ filter: 'status="OPEN" || status="PENDING"', expand: 'user_id' }));

	if (error) {
		toast.error('Failed to fetch open borrowings');
		return [];
	}

	return data.map((r) => {
		return { ...r, user: r.expand?.user_id || undefined, isCheckOut: false };
	});
});

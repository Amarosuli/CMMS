import { getRequestEvent, query } from '$app/server';
import type { BorrowMovement } from '$lib/CostumTypes';
import { tryCatch } from '$lib/TryCatch';
import { toast } from 'svelte-sonner';
import { optional, string } from 'valibot';

export const getOpenBorrowings = query(async () => {
	const { locals } = getRequestEvent();

	const { data, error } = await tryCatch(locals.pb.collection('borrow_movement').getFullList({ filter: 'status="OPEN" || status="PENDING"', expand: 'user_id' }));

	if (error) {
		toast.error('Failed to fetch open borrowings');
		return [] as BorrowMovement[];
	}

	return data.map((r) => {
		return { ...r, user: r.expand?.user_id || undefined, isCheckOut: false };
	});
});

export const getFrequentlyUsed = query(async () => {});
export const getMaterialMaintain = query(async () => {});
export const getFrequentlyBorrowed = query(async () => {});
export const getStockUnderMinimum = query(async () => {});

export const getTotalBorrowedToday = query(optional(string()), async (status) => {
	const { locals } = getRequestEvent();
	const filter = status == 'OPEN' ? 'status="OPEN" || status="PENDING"' : `status="CLOSED"`;

	const { data, error } = await tryCatch(locals.pb.collection('borrow_movement').getFullList({ filter, expand: 'user_id' }));

	if (error) {
		return 0;
	}

	return data.length;
});

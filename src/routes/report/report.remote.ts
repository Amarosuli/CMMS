import { getRequestEvent, query } from '$app/server';
import { tryCatch } from '$lib/TryCatch';
import { toast } from 'svelte-sonner';
import dayjs from 'dayjs';

export const getBorrowingItems = query('unchecked', async (borrowId: string) => {
	const { locals } = getRequestEvent();

	if (!borrowId) {
		toast.error('Borrow ID is required');
		return [];
	}

	const { data, error } = await tryCatch(locals.pb.collection('borrow_item').getFullList({ filter: 'borrow_id="' + borrowId + '"', expand: 'stock_id.material_id' }));

	if (error) {
		toast.error('Failed to fetch borrowing items');
		return [];
	}

	return data;
});

export const getBorrowingMovements = query('unchecked', async (filter: { status?: string; dateStart?: string; dateEnd?: string }) => {
	const { locals } = getRequestEvent();
	let status = filter.status ? filter.status : 'CLOSED';
	let dateStart = filter.dateStart ? filter.dateStart : dayjs().subtract(1, 'day').format('YYYY-MM-DD');
	let dateEnd = filter.dateEnd ? filter.dateEnd : dayjs().format('YYYY-MM-DD');

	const { data, error } = await tryCatch(locals.pb.collection('borrow_movement').getList(1, 10, { filter: 'status="' + status + '" && created >= "' + dateStart + '" && created <= "' + dateEnd + '"', expand: 'user_id' }));

	console.log(error);
	if (error) {
		toast.error('Failed to fetch borrowing report');
		return [];
	}

	return data.items.map((r) => {
		return { ...r, user: r.expand?.user_id || undefined };
	});
});

export const getBorrowingReport = query('unchecked', async (filter?: string) => {
	const { locals } = getRequestEvent();

	const { data, error } = await tryCatch(locals.pb.collection('borrow_report').getFullList({ filter: filter, expand: 'userId,stockId.material_id.unit_id' }));

	if (error) {
		toast.error('Failed to fetch borrowing report');
		return [];
	}

	return data.map((r) => {
		return {
			id: r.id,
			date: r.borrowDate.split(' ')[0],
			requester: r.expand?.userId.name.split(' ').slice(0, 2).join(' '),
			idNo: r.expand?.userId.username,
			partNumber: r.expand?.stockId.expand?.material_id.part_number,
			description: r.expand?.stockId.expand?.material_id.description,
			qty: r.qty + ' ' + r.expand?.stockId.expand?.material_id.expand?.unit_id.code,
			po: r.expand?.stockId.purchase_order,
			bn: r.expand?.stockId.batch_number,
			expiredDate: r.expand?.stockId.expired_date.split(' ')[0],
			condition: r.status,
			orderNumber: r.order_number,
			returned: r.returned
		};
	});
});

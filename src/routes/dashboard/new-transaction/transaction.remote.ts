import { getRequestEvent, query } from '$app/server';
import { BorrowStatus, type BorrowItem } from '$lib/CostumTypes';
import { tryCatch } from '$lib/TryCatch';
import { toast } from 'svelte-sonner';
import { array, nativeEnum, number, object, string } from 'zod';

export const getUserDetail = query(string(), async (userId) => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('users').getFirstListItem('username="' + userId + '"'));

	return { status, data };
});

export const getStockByBatchNumber = query(string(), async (batchNumber) => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('stock_master').getFirstListItem('batch_number="' + batchNumber + '"', { expand: 'material_id.unit_id' }));

	return { status, data };
});

export const getStockById = query(string(), async (stockId) => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('stock_master').getOne(stockId, { expand: 'material_id.unit_id' }));

	return { status, data };
});

export const createBorrow = query(object({ user_id: string(), status: nativeEnum(BorrowStatus), order_number: string(), esn: string() }), async (borrowData) => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('borrow_movement').create(borrowData));

	return { status, data };
});

export const addBorrowItem = query(
	object({
		borrow_id: string(),
		stock_id: string(),
		quantity_out: number(),
		date_out: string()
	}),
	async (item) => {
		const { locals } = getRequestEvent();
		const { status, data, error } = await tryCatch(locals.pb.collection('borrow_item').create(item));

		return { status, data };
	}
);

interface CheckOut {
	status: 'success' | 'failed';
	data?: BorrowItem;
	message?: string;
}

export const checkOut = query(
	object({
		basicData: object({
			user_id: string(),
			status: nativeEnum(BorrowStatus),
			order_number: string(),
			esn: string()
		}),
		itemData: array(
			object({
				borrow_id: string(),
				stock_id: string(),
				quantity_out: number()
			})
		)
	}),

	async ({ basicData, itemData }) => {
		let result: CheckOut[] = [] as CheckOut[];

		const { status: borrowStatus, data: borrowData } = await createBorrow(basicData);

		if (borrowData && borrowStatus === 'success') {
			toast.info('Create Borrow Success');
			for (let index = 0; index < itemData.length; index++) {
				const item = itemData[index];
				const { status, data } = await getStockById(item.stock_id);

				if (status === 'success' && data) {
					const updateStockResult = await updateStockOnCheckOut({ stockId: item.stock_id, current_quantity_borrowed: data.quantity_borrowed, quantity_out: item.quantity_out });
					const { status: addBorrowStatus, data: addBorrowData } = await addBorrowItem({ ...item, borrow_id: borrowData.id, date_out: new Date().toISOString() });

					if (addBorrowStatus === 'failed') {
						result.push({ status: addBorrowStatus, message: `Stock Not Found. Ref - ${item.stock_id}` });
					} else if (addBorrowData && addBorrowStatus === 'success') {
						result.push({ status: addBorrowStatus, data: addBorrowData, message: `Success borrow ${item.stock_id}` });
					}
				} else {
					result.push({ status: 'failed', message: `Stock Not Found. Ref - ${item.stock_id}` });
				}
			}
		}
		return result;
	}
);

export const updateStockOnCheckOut = query(
	object({
		stockId: string(),
		current_quantity_borrowed: number(),
		quantity_out: number()
	}),
	async ({ stockId, current_quantity_borrowed, quantity_out }) => {
		const { locals } = getRequestEvent();
		const { status, data, error } = await tryCatch(locals.pb.collection('stock_master').update(stockId, { quantity_borrowed: current_quantity_borrowed + quantity_out }));

		return { status, data };
	}
);

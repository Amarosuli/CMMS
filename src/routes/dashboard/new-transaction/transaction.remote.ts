import { getRequestEvent, query } from '$app/server';
import { BorrowStatus, type BorrowItem } from '$lib/CostumTypes';
import { toast } from 'svelte-sonner';
import { array, nativeEnum, number, object, string } from 'zod';

export const getUserDetail = query(string(), async (userId) => {
	const { locals } = getRequestEvent();
	return locals.pb
		.collection('users')
		.getFirstListItem('username="' + userId + '"')
		.then((user) => {
			console.log(user);
			return { status: 'success', data: user };
		})
		.catch((err) => {
			return { status: 'fail', data: null };
		});
});

export const getStockByBatchNumber = query(string(), async (batchNumber) => {
	const { locals } = getRequestEvent();
	return locals.pb
		.collection('stock_master')
		.getFirstListItem('batch_number="' + batchNumber + '"', { expand: 'material_id.unit_id' })
		.then((stock) => {
			return { status: 'success', data: stock };
		})
		.catch((err) => {
			return { status: 'fail', data: null };
		});
});

export const getStockById = query(string(), async (stockId) => {
	const { locals } = getRequestEvent();
	return locals.pb
		.collection('stock_master')
		.getOne(stockId, { expand: 'material_id.unit_id' })
		.then((stock) => {
			return { status: 'success', data: stock };
		})
		.catch((err) => {
			return { status: 'fail', data: null };
		});
});

export const createBorrow = query(object({ user_id: string(), status: nativeEnum(BorrowStatus), order_number: string(), esn: string() }), async (data) => {
	const { locals } = getRequestEvent();

	return locals.pb
		.collection('borrow_movement')
		.create(data)
		.then((borrow) => {
			return { status: 'success', data: borrow };
		})
		.catch((err) => {
			return { status: 'fail', data: null };
		});
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

		return locals.pb
			.collection('borrow_item')
			.create(item)
			.then((borrowItem) => {
				return { status: 'success', data: borrowItem };
			})
			.catch((err) => {
				return { status: 'fail', data: null };
			});
	}
);

interface CheckOut {
	status: 'success' | 'fail';
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
		let result: CheckOut[] = $state([]) as CheckOut[];

		const { status: borrowStatus, data: borrowData } = await createBorrow(basicData);

		if (borrowData && borrowStatus === 'success') {
			toast.info('Create Borrow Success')
			for (let index = 0; index < itemData.length; index++) {
				const item = itemData[index];
				const { status, data } = await getStockById(item.stock_id);

				if (status === 'success' && data) {
					const updateStockResult = await updateStockOnCheckOut({ stockId: item.stock_id, current_quantity_borrowed: data.quantity_borrowed, quantity_out: item.quantity_out });
					const { status: addBorrowStatus, data: addBorrowData } = await addBorrowItem({ ...item, borrow_id: borrowData.id, date_out: new Date().toISOString() });

					if (addBorrowStatus === 'fail') {
						result.push({ status: addBorrowStatus, message: `Stock Not Found. Ref - ${item.stock_id}` });
					} else if (addBorrowData && addBorrowStatus === 'success') {
						result.push({ status: addBorrowStatus, data: addBorrowData });
					}
				} else {
					result.push({ status: 'fail', message: `Stock Not Found. Ref - ${item.stock_id}` });
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

		return locals.pb
			.collection('stock_master')
			.update(stockId, { quantity_borrowed: current_quantity_borrowed + quantity_out })
			.then((result) => {
				return { status: 'success', data: result };
			})
			.catch((err) => {
				return { status: 'fail', data: null };
			});
	}
);

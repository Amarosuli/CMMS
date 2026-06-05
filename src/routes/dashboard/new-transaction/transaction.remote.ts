import { array, nativeEnum, number, object, string } from 'zod';
import { getRequestEvent, query } from '$app/server';
import { BorrowMovementStatus } from '$lib/CostumTypes';
import { customAlphabet } from 'nanoid';
import { tryCatch } from '$lib/TryCatch';
import type { BatchRequestResult } from 'pocketbase';

export const getUserDetail = query(string(), async (userId) => {
	const { locals } = getRequestEvent();
	const { status, data } = await tryCatch(locals.pb.collection('users').getFirstListItem('username="' + userId + '"'));

	return { status, data };
});

export const getStockItemByLabel = query(string(), async (label) => {
	const { locals } = getRequestEvent();
	const { data, error } = await tryCatch(locals.pb.collection('stock_item').getFirstListItem('label="' + label + '"', { expand: 'stock_master_id.material_master_id.material_unit_id' }));

	if (error) {
		return null;
	}

	if (data) {
		return data;
	} else {
		return null;
	}
});

export const getStockItemById = query(string(), async (stockId) => {
	const { locals } = getRequestEvent();
	const { status, data } = await tryCatch(locals.pb.collection('stock_item').getOne(stockId, { expand: 'stock_master_id.material_master_id.material_unit_id' }));

	if (status === 'failed') return { status, data: null };
	if (status === 'success') return { status, data };
});

export const createBorrow = query(object({ user_id: string(), status: nativeEnum(BorrowMovementStatus), order_number: string(), esn: string() }), async (borrowData) => {
	const { locals } = getRequestEvent();
	const { status, data } = await tryCatch(locals.pb.collection('borrow_movement').create(borrowData));

	if (status === 'failed') return { status, data: null };
	if (status === 'success') return { status, data };
});

export const addBorrowItem = query(object({ borrow_movement_id: string(), stock_item_id: string(), quantity_out: number(), date_out: string() }), async (item) => {
	const { locals } = getRequestEvent();
	const { status, data } = await tryCatch(locals.pb.collection('borrow_item').create(item));

	if (status === 'failed') return { status, data: null };
	if (status === 'success') return { status, data };
});

interface CheckOut {
	status: 'success' | 'failed';
	data?: BatchRequestResult[];
	message?: string;
}

export const checkOut = query(
	object({
		basicData: object({
			user_id: string(),
			status: nativeEnum(BorrowMovementStatus),
			order_number: string(),
			esn: string()
		}),
		itemData: array(
			object({
				stock_item_id: string(),
				quantity_out: number()
			})
		)
	}),

	async ({ basicData, itemData }) => {
		const { locals } = getRequestEvent();

		const result: CheckOut[] = [] as CheckOut[];

		const borrowMovementId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 15)();

		const batch = locals.pb.createBatch();

		batch.collection('borrow_movement').create({ ...basicData, id: borrowMovementId });

		if (itemData) {
			for (const item of itemData) {
				batch.collection('borrow_item').create({ borrow_movement_id: borrowMovementId, stock_item_id: item.stock_item_id, quantity_out: item.quantity_out, date_out: new Date().toISOString() });
			}
		}

		const { data, error } = await tryCatch(batch.send());

		if (error) {
			result.push({ status: 'failed', message: error.message });
		} else {
			result.push({ status: 'success', message: 'Borrowing Success', data: data });
		}

		return result;
	}
);

export const updateStockOnCheckOut = query(object({ stock_item_id: string(), current_quantity_borrowed: number(), quantity_out: number() }), async ({ stock_item_id, current_quantity_borrowed, quantity_out }) => {
	const { locals } = getRequestEvent();
	const { status, data } = await tryCatch(locals.pb.collection('stock_item').update(stock_item_id, { quantity_borrowed: current_quantity_borrowed + quantity_out }));

	return { status, data };
});

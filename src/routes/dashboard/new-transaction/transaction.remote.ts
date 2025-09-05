import { getRequestEvent, query } from '$app/server';
import { BorrowStatus } from '$lib/CostumTypes';
import { error, json } from '@sveltejs/kit';
import { add } from 'layerchart';
import type { RecordModel } from 'pocketbase';
import { array, nativeEnum, number, object, string } from 'zod';

export const getUserDetail = query(string(), async (userId) => {
	const { locals } = getRequestEvent();
	return locals.pb
		.collection('users')
		.getFirstListItem('username="' + userId + '"')
		.then((user) => {
			return { status: 'success', data: user };
		})
		.catch((err) => {
			return { status: 'fail', data: null };
		});
});

export const getStockItem = query(string(), async (batchNumber) => {
	const { locals } = getRequestEvent();
	const stockItem = await locals.pb.collection('stock_master').getFirstListItem('batch_number="' + batchNumber + '"', { expand: 'material_id.unit_id' });

	return stockItem;
});

export const getStockItemById = query(string(), async (stockId) => {
	const { locals } = getRequestEvent();
	const stock = await locals.pb.collection('stock_master').getOne(stockId);

	return stock;
});

export const createBorrow = query(object({ user_id: string(), status: nativeEnum(BorrowStatus), order_number: string(), esn: string() }), async (data) => {
	const { locals } = getRequestEvent();

	const borrowing = await locals.pb.collection('borrow_movement').create(data);
	if (!borrowing) return error(500, 'Failed to create borrowing record');

	return borrowing;
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

		const borrowItem = await locals.pb.collection('borrow_item').create(item);
		if (!borrowItem) return error(500, 'Failed to create borrow item record');

		return borrowItem;
	}
);

export const createTransaction = query(
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
				quantity_out: number(),
				date_out: string()
			})
		)
	}),
	async ({ basicData, itemData }) => {
		const { locals } = getRequestEvent();
		let result: RecordModel[] = [];

		const borrowData = await createBorrow(basicData);

		for (let index = 0; index < itemData.length; index++) {
			const item = itemData[index];

			const stock = await getStockItemById(item.stock_id);
			await locals.pb.collection('stock_master').update(item.stock_id, { ...stock, quantity_borrowed: stock.quantity_borrowed + item.quantity_out });
			result[index] = await addBorrowItem({ ...item, borrow_id: borrowData.id });

			return result;
		}
	}
);

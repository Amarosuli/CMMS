import { array, enum_, number, object, string, intersect, omit, boolean } from 'valibot';
import { BorrowItemSchema, BorrowMovementSchema, RecordModelSchema } from '../valibotSchema';
import { BorrowMovementStatus, StockItemStatus, StockMasterStatus } from '../CostumTypes';
import { command, getRequestEvent, query } from '$app/server';
import { customAlphabet } from 'nanoid';
import { tryCatch } from '../TryCatch';

import type { BatchRequestResult } from 'pocketbase';

export const getUserByUsername = query(string(), async (username) => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('users').getFirstListItem(locals.pb.filter('username = {:username}', { username })));

	if (error) {
		return { status, message: error.message, data };
	} else {
		return { status, message: 'User data found', data };
	}
});

export const getStockItemByLabel = query(string(), async (label) => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('stock_item').getFirstListItem(locals.pb.filter('label = {:label}', { label })));

	if (error) {
		return { status, message: error.message, data };
	} else {
		return { status, message: status, data };
	}
});

export const getStockItemById = query(string(), async (stockId) => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('stock_item').getOne(stockId, { expand: 'stock_master_id.material_master_id.material_unit_id' }));

	if (error) {
		return { status, message: error.message, data };
	} else {
		return { status, message: status, data };
	}
});

export const borrowStart = query(
	object({
		movement: object({
			user_id: string(),
			status: enum_(BorrowMovementStatus),
			order_number: string(),
			esn: string()
		}),
		items: array(
			object({
				stock_item_id: string(),
				quantity_out: number()
			})
		)
	}),

	async ({ movement, items }) => {
		const { locals } = getRequestEvent();

		const borrowMovementId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 15)();

		const batch = locals.pb.createBatch();

		batch.collection('borrow_movement').create({ ...movement, id: borrowMovementId });

		if (items) {
			for (const item of items) {
				batch.collection('borrow_item').create({ borrow_movement_id: borrowMovementId, stock_item_id: item.stock_item_id, quantity_out: item.quantity_out, date_out: new Date().toISOString() });
				batch.collection('stock_item').update(item.stock_item_id, { isBorrowed: true, status: StockItemStatus.BORROWED });
			}
		}

		const { status, data, error } = await tryCatch(batch.send());

		if (error) {
			return { status, message: error.message, data: [] as BatchRequestResult[] };
		} else {
			return { status, message: 'Borrowing Success', data };
		}
	}
);

export const editBorrowMovement = query(object({ borrowMovementId: string(), borrowMovement: BorrowMovementSchema }), async ({ borrowMovementId, borrowMovement }) => {
	const { locals } = getRequestEvent();

	const { status, error } = await tryCatch(locals.pb.collection('borrow_movement').update(borrowMovementId, borrowMovement));

	if (error) {
		return { status, message: error.message };
	} else {
		return { status, message: 'Borrow movement updated successfully' };
	}
});

export const addBorrowItem = query(
	object({
		borrowMovementId: string(),
		items: array(
			object({
				stock_item_id: string(),
				quantity_out: number()
			})
		)
	}),
	async ({ items, borrowMovementId }) => {
		const { locals } = getRequestEvent();
		const batch = locals.pb.createBatch();

		if (items) {
			for (const item of items) {
				batch.collection('borrow_item').create({ borrow_movement_id: borrowMovementId, stock_item_id: item.stock_item_id, quantity_out: item.quantity_out, date_out: new Date().toISOString() });
				batch.collection('stock_item').update(item.stock_item_id, { isBorrowed: true, status: StockItemStatus.BORROWED });
			}
		}

		const { status, data, error } = await tryCatch(batch.send());

		if (error) {
			return { status, message: error.message, data: [] as BatchRequestResult[] };
		} else {
			return { status, message: 'Items added successfully', data };
		}
	}
);

export const removeBorrowedItem = query(intersect([omit(BorrowItemSchema, ['quantity_return', 'date_return', 'quantity_out', 'date_out']), RecordModelSchema]), async (item) => {
	const { locals } = getRequestEvent();

	let stockStatusAfterDelete = StockItemStatus.NEW;
	// check if stock item is already borrowed in other borrow movements
	const isBorrowedBefore = await tryCatch(
		locals.pb.collection('borrow_item').getList(1, 1, {
			filter: locals.pb.filter('stock_item_id = {:stockItemId} && borrow_movement_id != {:movementId}', { stockItemId: item.stock_item_id, movementId: item.borrow_movement_id })
		})
	);

	if (isBorrowedBefore.data) {
		if (isBorrowedBefore.data.totalItems > 0) {
			stockStatusAfterDelete = StockItemStatus.USED;
		}
	}

	const batch = locals.pb.createBatch();
	// get borrow item id, delete
	batch.collection('borrow_item').delete(item.id);
	// balance stock item
	batch.collection('stock_item').update(item.stock_item_id, { isBorrowed: false, status: stockStatusAfterDelete });

	const { data, error } = await tryCatch(batch.send());

	if (error) {
		return { status: 'failed', message: error.message, data: [] };
	} else {
		return { status: 'success', message: 'Borrow Item removed successfully', data };
	}
});

export const borrowEnd = command(object({ movementId: string(), items: array(intersect([BorrowItemSchema, RecordModelSchema, object({ isReturn: boolean() })])) }), async ({ movementId, items }) => {
	const { locals } = getRequestEvent();

	// use batch process
	const batch = locals.pb.createBatch();

	// get borrow movement id, update status, save
	batch.collection('borrow_movement').update(movementId, { status: BorrowMovementStatus.CLOSED });
	// get borrow item id, update quantity in, save
	for (const item of items) {
		batch.collection('borrow_item').update(item.id, { quantity_return: item.quantity_return, date_return: item.date_return });
		batch.collection('stock_item').update(item.stock_item_id, { status: item.isReturn ? StockItemStatus.USED : StockItemStatus.DISPOSED, isBorrowed: false });
		if (!item.isReturn) {
			// if not return, get stock master data
			const stockMaster = await tryCatch(locals.pb.collection('stock_item').getOne(item.stock_item_id, { expand: 'stock_master_id' }));

			if (stockMaster.data) {
				// check if quantity available is 0, stock master will be INACTIVE else just update quantity available
				if (stockMaster.data.expand?.stock_master_id.quantity_available - item.quantity_return === 0) {
					batch.collection('stock_master').update(stockMaster.data.expand?.stock_master_id.id, { quantity_available: 0, status: StockMasterStatus.INACTIVE });
				} else {
					batch.collection('stock_master').update(stockMaster.data.expand?.stock_master_id.id, { quantity_available: stockMaster.data.expand?.stock_master_id.quantity_available - item.quantity_return });
				}
			}
		}
	}

	const { data, error } = await tryCatch(batch.send());
	if (error) {
		return { status: 'failed', message: error.message, data: [] };
	} else {
		return { status: 'success', message: 'Return Success', data };
	}
});

export const deleteBorrowMovement = command(string(), async (borrowMovementId) => {
	const { locals } = getRequestEvent();

	const borrowMovement = await tryCatch(locals.pb.collection('borrow_movement').getOne(borrowMovementId));

	if (borrowMovement.error) {
		return { status: 'failed', message: borrowMovement.error.message };
	}

	// get all borrow item
	const borrowItems = await tryCatch(locals.pb.collection('borrow_item').getFullList({ filter: `borrow_movement_id = "${borrowMovementId}"`, expand: 'stock_item_id' }));

	if (borrowItems.error) {
		return { status: 'failed', message: borrowItems.error.message };
	}

	const batch = locals.pb.createBatch();

	if (borrowItems.data.length === 0) {
		batch.collection('borrow_movement').delete(borrowMovementId);
	} else {
		if (borrowMovement.data.status === BorrowMovementStatus.CLOSED) {
			// maintain different, pastikan stock item dan stock master disesuaikan
			// check item yang disposed,
			// stock item perlu di update USED,
			// dan stock master perlu di sesuaikan kuantitasnya.
			// stock out juga perlu di delete
			for (const item of borrowItems.data) {
				if (item.expand?.stock_item_id.status === StockItemStatus.DISPOSED) {
					batch.collection('stock_master').update(item.expand?.stock_item_id.stock_master_id, { quantity_available: item.expand?.stock_item_id.size, status: StockMasterStatus.ACTIVE });
				}
				batch.collection('stock_item').update(item.stock_item_id, { status: StockItemStatus.USED, isBorrowed: false });
			}
		} else {
			for (const item of borrowItems.data) {
				await removeBorrowedItem({ borrow_movement_id: borrowMovementId, id: item.id, stock_item_id: item.stock_item_id });
			}
			batch.collection('borrow_movement').delete(borrowMovementId);
		}
	}

	const { error } = await tryCatch(batch.send());

	if (error) {
		return { status: 'failed', message: error.message, data: [] };
	} else {
		return { status: 'success', message: 'Borrow movement deleted successfully', data };
	}
	//
	// delete borrowMovement
});

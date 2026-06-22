import { array, enum_, number, object, string, intersect, omit, boolean, optional } from 'valibot';
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

	const { status, data, error } = await tryCatch(locals.pb.collection('borrow_movement').update(borrowMovementId, borrowMovement));

	if (error) {
		return { status, message: error.message, data };
	} else {
		return { status, message: 'Borrow movement updated successfully', data };
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

export const removeBorrowedItem = command(intersect([omit(BorrowItemSchema, ['quantity_return', 'date_return', 'quantity_out', 'date_out']), RecordModelSchema]), async (item) => {
	const { locals } = getRequestEvent();

	let stockItemStatusAfter = StockItemStatus.NEW;
	// check if stock item is already borrowed in other borrow movements, stockItemStatusAfter is USED
	const isBorrowedBefore = await tryCatch(
		locals.pb.collection('borrow_item').getList(1, 1, {
			filter: locals.pb.filter('stock_item_id = {:stockItemId} && borrow_movement_id != {:borrowMovementId}', { stockItemId: item.stock_item_id, borrowMovementId: item.borrow_movement_id })
		})
	);

	if (isBorrowedBefore.data) {
		if (isBorrowedBefore.data.totalItems > 0) {
			stockItemStatusAfter = StockItemStatus.USED;
		} else {
			stockItemStatusAfter = StockItemStatus.NEW;
		}
	}

	const batch = locals.pb.createBatch();
	// get borrow item id, delete
	batch.collection('borrow_item').delete(item.id);
	// balance stock item
	batch.collection('stock_item').update(item.stock_item_id, { isBorrowed: false, status: stockItemStatusAfter });

	const { status, data, error } = await tryCatch(batch.send());

	if (error) {
		return { status, message: error.message, data };
	} else {
		return { status, message: 'Borrow Item removed successfully', data };
	}
});

export const borrowEnd = command(object({ movementId: string(), userId: string(), items: array(intersect([BorrowItemSchema, RecordModelSchema, object({ isReturn: boolean() })])) }), async ({ movementId, userId, items }) => {
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

			batch.collection('stock_out').create({ stock_item_id: item.stock_item_id, user_id: userId, quantity: item.quantity_return, remark: 'Stock out by borrowing movement', borrow_item_id: item.id });

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

	const { status, data, error } = await tryCatch(batch.send());
	if (error) {
		console.log(error);
		console.log(data);
		return { status, message: error.message, data };
	} else {
		return { status, message: 'Return Success', data };
	}
});

// export const deleteOpenBorrowMovement = command(string(), async (borrowMovementId) => {
// 	const { locals } = getRequestEvent();

// 	const borrowMovement = await tryCatch(locals.pb.collection('borrow_movement').getOne(borrowMovementId));

// 	if (borrowMovement.error) {
// 		return { status: 'failed', message: borrowMovement.error.message };
// 	}

// 	// get all borrow item
// 	const borrowItems = await tryCatch(locals.pb.collection('borrow_item').getFullList({ filter: `borrow_movement_id = "${borrowMovementId}"`, expand: 'stock_item_id' }));

// 	if (borrowItems.error) {
// 		return { status: 'failed', message: borrowItems.error.message };
// 	}

// 	const batch = locals.pb.createBatch();

// 	if (borrowItems.data.length) {
// 		for (const item of borrowItems.data) {
// 			let stockItemStatusAfter = StockItemStatus.NEW;
// 			// await removeBorrowedItem({ borrow_movement_id: borrowMovementId, id: item.id, stock_item_id: item.stock_item_id });
// 			// check if stock item is already borrowed in other borrow movements, stockItemStatusAfter is USED
// 			const isBorrowedBefore = await tryCatch(
// 				locals.pb.collection('borrow_item').getList(1, 1, {
// 					filter: locals.pb.filter('stock_item_id = {:stockItemId} && borrow_movement_id != {:borrowMovementId}', { stockItemId: item.stock_item_id, borrowMovementId: item.borrow_movement_id })
// 				})
// 			);

// 			if (isBorrowedBefore.data) {
// 				if (isBorrowedBefore.data.totalItems > 0) {
// 					stockItemStatusAfter = StockItemStatus.USED;
// 				} else {
// 					stockItemStatusAfter = StockItemStatus.NEW;
// 				}
// 			}

// 			// get borrow item id, delete
// 			batch.collection('borrow_item').delete(item.id);
// 			// balance stock item
// 			batch.collection('stock_item').update(item.stock_item_id, { isBorrowed: false, status: stockItemStatusAfter });
// 		}
// 	}
// 	// jika tidak ada borrow item, langsung delete borrow movement
// 	batch.collection('borrow_movement').delete(borrowMovementId);

// 	const { status, data, error } = await tryCatch(batch.send());

// 	if (error) {
// 		return { status, message: error.message, data };
// 	} else {
// 		return { status, message: 'Borrow movement deleted successfully', data };
// 	}
// });

export const getActiveBorrowing = query(optional(enum_(BorrowMovementStatus)), async (borrowMovementStatus) => {
	const { locals } = getRequestEvent();

	const borrowMovementStatusFilter = borrowMovementStatus ?? BorrowMovementStatus.OPEN;

	const { status, data, error } = await tryCatch(locals.pb.collection('borrow_movement').getFullList({ filter: locals.pb.filter('status = {:status}', { status: borrowMovementStatusFilter }), expand: 'user_id' }));

	if (error) {
		return { status, message: error.message, data };
	} else {
		return { status, message: 'Borrow movement deleted successfully', data };
	}
});

export const getItemFromActiveBorrowing = query(string(), async (borrowMovementId) => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('borrow_item').getFullList({ filter: locals.pb.filter('borrow_movement_id = {:borrowMovementId}', { borrowMovementId }), expand: 'stock_item_id.stock_master_id.material_master_id.material_unit_id' }));

	if (error) {
		return { status, message: error.message, data };
	} else {
		return { status, message: 'Borrow movement retrieved successfully', data };
	}
});

export const updateAllStockItemOnDeleteOpenBorrowMovement = command(array(intersect([omit(BorrowItemSchema, ['quantity_return', 'date_return', 'quantity_out', 'date_out']), RecordModelSchema])), async (BorrowItems) => {
	const { locals } = getRequestEvent();

	const batch = locals.pb.createBatch();

	for (const BorrowItem of BorrowItems) {
		const { borrow_movement_id, stock_item_id, id } = BorrowItem;

		let stockItemStatusAfter = StockItemStatus.NEW;
		// check if stock item is already borrowed in other borrow movements, stockItemStatusAfter is USED
		const isBorrowedBefore = await tryCatch(
			locals.pb.collection('borrow_item').getList(1, 1, {
				filter: locals.pb.filter('stock_item_id = {:stockItemId} && borrow_movement_id != {:borrowMovementId}', { stockItemId: stock_item_id, borrowMovementId: borrow_movement_id })
			})
		);

		if (isBorrowedBefore.data) {
			if (isBorrowedBefore.data.totalItems > 0) {
				stockItemStatusAfter = StockItemStatus.USED;
			} else {
				stockItemStatusAfter = StockItemStatus.NEW;
			}
		}

		// balance stock item
		batch.collection('stock_item').update(stock_item_id, { isBorrowed: false, status: stockItemStatusAfter });
	}

	const { status, data, error } = await tryCatch(batch.send());

	if (error) {
		return { status, message: error.message, data };
	} else {
		return { status, message: 'All stock items updated successfully', data };
	}
});

export const deleteOpenBorrowMovement = command(string(), async (borrowMovementId) => {
	const { locals } = getRequestEvent();
	const { status, data, error } = await tryCatch(locals.pb.collection('borrow_movement').delete(borrowMovementId));

	if (error) {
		return { status, message: error.message, data };
	} else {
		return { status, message: 'Borrow movement and all borrow items deleted successfully', data };
	}
});

// export const removeDisposedBorrowedItem = command(object({ borrowItemId: string(), stockItemId: string() }), async ({ borrowItemId, stockItemId }) => {
// 	const { locals } = getRequestEvent();

// 	const stockOut = await tryCatch(locals.pb.collection('stock_out').getFirstListItem(locals.pb.filter('stock_item_id = {:stockItemId', { stockItemId })));

// 	if (stockOut.status === 'failed') {
// 		return { status: stockOut.status, message: 'Stock Out not found', data: stockOut.data };
// 	}

// 	// akan update borrow_item, stock_item, dan stock_master
// 	const cancelStockOutResult = await tryCatch(cancelStockOut(stockOut.data.id));

// 	if (cancelStockOutResult.status === 'failed') {
// 		return { status: cancelStockOutResult.status, message: 'Cancel stock out failed', data: cancelStockOutResult.data };
// 	}

// 	const deleteBorrowItem = await tryCatch(locals.pb.collection('borrow_item').delete(borrowItemId));

// 	if (deleteBorrowItem.status === 'failed') {
// 		return { status: deleteBorrowItem.status, message: deleteBorrowItem.error.message, data: deleteBorrowItem.data };
// 	} else {
// 		return { status: deleteBorrowItem.status, message: 'Delete borrow item successfully', data: deleteBorrowItem.data };
// 	}
// });

// export const deleteClosedBorrowMovement = command(string(), async (borrowMovementId) => {
// 	const { locals } = getRequestEvent();

// 	const borrowMovement = await tryCatch(locals.pb.collection('borrow_movement').getOne(borrowMovementId));

// 	if (borrowMovement.error) {
// 		return { status: 'failed', message: borrowMovement.error.message };
// 	}

// 	// get all borrow item
// 	const borrowItems = await tryCatch(locals.pb.collection('borrow_item').getFullList({ filter: `borrow_movement_id = "${borrowMovementId}"`, expand: 'stock_item_id' }));

// 	if (borrowItems.error) {
// 		return { status: 'failed', message: borrowItems.error.message };
// 	}

// 	const batch = locals.pb.createBatch();

// 	if (borrowItems.data.length) {
// 		if (borrowMovement.data.status === BorrowMovementStatus.CLOSED) {
// 			// kalau yang di hapus adalah borrow movement yang sudah closed
// 			// pastikan stock item dan stock master disesuaikan terlebih dahulu
// 			// check apakah ada item yang disposed,
// 			// stock item perlu di update USED,
// 			// dan stock master perlu di sesuaikan kuantitasnya.
// 			// stock out juga perlu di delete
// 			const disposedItem = borrowItems.data.filter((item) => item.expand?.stock_item_id.status === StockItemStatus.DISPOSED);
// 			for (const item of borrowItems.data) {
// 				if (item.expand?.stock_item_id.status === StockItemStatus.DISPOSED) {
// 					batch.collection('stock_master').update(item.expand?.stock_item_id.stock_master_id, { quantity_available: item.expand?.stock_item_id.size, status: StockMasterStatus.ACTIVE });
// 				}
// 				batch.collection('stock_item').update(item.stock_item_id, { status: StockItemStatus.USED, isBorrowed: false });
// 			}
// 		} else {
// 			for (const item of borrowItems.data) {
// 				await removeBorrowedItem({ borrow_movement_id: borrowMovementId, id: item.id, stock_item_id: item.stock_item_id });
// 			}
// 			// akan remove borrow item
// 			batch.collection('borrow_movement').delete(borrowMovementId);
// 		}
// 	} else {
// 		// jika tidak ada borrow item, langsung delete borrow movement
// 		batch.collection('borrow_movement').delete(borrowMovementId);
// 	}

// 	const { status, data, error } = await tryCatch(batch.send());

// 	if (error) {
// 		return { status, message: error.message, data };
// 	} else {
// 		return { status, message: 'Borrow movement deleted successfully', data };
// 	}
// });

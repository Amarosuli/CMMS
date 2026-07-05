import { StockItemStatus, StockMasterStatus } from '$lib/CostumTypes';
import { command, getRequestEvent, query } from '$app/server';
import { StockInSchema, StockOutSchema } from '$lib/valibotSchema';
import { customAlphabet } from 'nanoid';
import { tryCatch } from '$lib/TryCatch';
import { string } from 'valibot';

export const createStockIn = query(StockInSchema, async (stockInData) => {
	const { locals } = getRequestEvent();
	const batchNumber = stockInData.batch_number;
	const isBatchNumberExist = await tryCatch(locals.pb.collection('stock_master').getFirstListItem(locals.pb.filter('batch_number = {:batchNumber}', { batchNumber })));

	if (isBatchNumberExist.data) {
		return { status: 'failed' as const, message: 'Batch number already exist', data: null };
	}

	const stockInId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 15)();
	const batch = locals.pb.createBatch();

	// createStockIn
	batch.collection('stock_in').create({ ...stockInData, id: stockInId });
	// createStockMaster
	batch.collection('stock_master').create({
		...stockInData,
		status: StockMasterStatus.ACTIVE,
		stock_in_id: stockInId,
		quantity_available: stockInData.quantity
	});
	// createStockItem handled by PocketBase hook 'create_stock_item_after_stock_master'.

	const batchResult = await tryCatch(batch.send());

	if (batchResult.status === 'failed') {
		return { status: batchResult.status, message: 'Error creating stock in', data: null };
	}

	return { status: batchResult.status, message: 'Stock in created successfully', data: batchResult.data };
});

export const createStockOut = query(StockOutSchema, async (stockOutData) => {
	const { locals } = getRequestEvent();
	const stockItemId = stockOutData.stock_item_id;
	const stockItem = await tryCatch(locals.pb.collection('stock_item').getOne(stockItemId, { expand: 'stock_master_id' }));

	if (stockItem.status === 'failed') {
		return { status: stockItem.status, message: 'Error fetching stock item', data: null };
	}

	if (!stockItem.data.expand?.stock_master_id) {
		return { status: 'failed' as const, message: 'Stock master not found', data: null };
	}

	const batch = locals.pb.createBatch();
	const stockMasterId = stockItem.data.expand.stock_master_id.id;
	const qtyAvailable = stockItem.data.expand.stock_master_id.quantity_available;

	if (qtyAvailable < stockOutData.quantity) {
		return { status: 'failed' as const, message: `Error, quantity available in stock master ${qtyAvailable} is less than stock out quantity ${stockOutData.quantity}`, data: null };
	}

	const finalQty = qtyAvailable - stockOutData.quantity;
	const finalStatus = finalQty === 0 ? StockMasterStatus.INACTIVE : StockMasterStatus.ACTIVE;

	// updateStockItem
	batch.collection('stock_item').update(stockOutData.stock_item_id, { status: StockItemStatus.DISPOSED, isBorrowed: false });
	// updateStockMaster
	batch.collection('stock_master').update(stockMasterId, { quantity_available: finalQty, status: finalStatus });
	// createStockOut
	batch.collection('stock_out').create(stockOutData);

	const batchResult = await tryCatch(batch.send());

	if (batchResult.status === 'failed') {
		return { status: batchResult.status, message: 'Error creating stock out', data: null };
	}

	return { status: batchResult.status, message: 'Stock out created successfully', data: batchResult.data };
});

export const cancelStockIn = command(string(), async (stockInId) => {
	const { locals } = getRequestEvent();
	const stockMaster = await tryCatch(locals.pb.collection('stock_master').getFirstListItem(`stock_in_id="${stockInId}"`));

	if (stockMaster.status === 'failed' || stockMaster.data === null) {
		const batch = locals.pb.createBatch();
		batch.collection('stock_in').delete(stockInId);
		const deleteStockIn = await tryCatch(batch.send());

		if (deleteStockIn.status === 'failed') {
			return { status: deleteStockIn.status, message: 'Error cancel stock in', data: deleteStockIn.data };
		} else {
			return { status: deleteStockIn.status, message: 'Stock in cancelled successfully', data: deleteStockIn.data };
		}
	}

	// checkBorrowItem
	const isAlreadyUsed = await tryCatch(locals.pb.collection('borrow_item').getFirstListItem(`stock_item_id.stock_master_id = "${stockMaster.data.id}"`));
	// checkStockOut
	const isAlreadyOut = await tryCatch(locals.pb.collection('stock_out').getFirstListItem(`stock_item_id.stock_master_id = "${stockMaster.data.id}"`));

	if (isAlreadyUsed.data) {
		return { status: 'failed' as const, message: 'Unable to cancle stock in, this stock exist in borrowing history. Reference id ' + isAlreadyUsed.data.borrow_movement_id, data: null };
	}

	if (isAlreadyOut.data) {
		return { status: 'failed' as const, message: 'Unable to cancle stock in, this stock exist in stock out history. Reference id ' + isAlreadyOut.data.id, data: null };
	}

	const batch = locals.pb.createBatch();
	// deleteStockIn
	batch.collection('stock_in').delete(stockInId);
	// deleteStockMaster
	batch.collection('stock_master').delete(stockMaster.data.id);
	// deleteStockItem handled by cascade delete.

	const batchResult = await tryCatch(batch.send());

	if (batchResult.status === 'failed') {
		return { status: batchResult.status, message: 'Error cancel stock in', data: batchResult.data };
	} else {
		return { status: batchResult.status, message: 'Stock in cancelled successfully', data: batchResult.data };
	}
});

export const cancelStockOut = command(string(), async (stockOutId) => {
	const { locals } = getRequestEvent();
	const stockOut = await tryCatch(
		locals.pb.collection('stock_out').getOne(stockOutId, {
			expand: 'stock_item_id.stock_master_id'
		})
	);

	if (stockOut.status === 'failed' || stockOut.data === null) {
		return { status: stockOut.status, message: 'Stock out not found', data: null };
	}

	// ambil stock_item_id, stock_master_id dan borrow_item_id dari stock out
	const borrowItemId = stockOut.data.borrow_item_id;
	const stockItemId = stockOut.data.stock_item_id;
	const stockMasterId = stockOut.data.expand?.stock_item_id.expand.stock_master_id.id;
	const stockMasterQtyAvailableBefore = stockOut.data.expand?.stock_item_id.expand.stock_master_id.quantity_available;
	const batch = locals.pb.createBatch();

	if (borrowItemId) {
		batch.collection('borrow_item').update(borrowItemId, { quantity_return: stockOut.data.quantity });
		batch.collection('stock_item').update(stockItemId, { status: StockItemStatus.USED });
	} else {
		batch.collection('stock_item').update(stockItemId, { status: StockItemStatus.NEW });
	}

	// updateStockMaster
	batch.collection('stock_master').update(stockMasterId, { quantity_available: stockMasterQtyAvailableBefore + stockOut.data.quantity, status: StockMasterStatus.ACTIVE });

	batch.collection('stock_out').delete(stockOutId);

	const batchResult = await tryCatch(batch.send());

	if (batchResult.status === 'failed') {
		return { status: batchResult.status, message: 'Error cancel stock out', data: batchResult.data };
	} else {
		return { status: batchResult.status, message: 'Stock out cancelled successfully', data: batchResult.data };
	}
});

export const openDisposedStockItem = command(string(), async (borrowItemId) => {
	const { locals } = getRequestEvent();

	const borrowItem = await tryCatch(locals.pb.collection('borrow_item').getOne(borrowItemId, { expand: 'stock_item_id.stock_master_id' }));

	if (borrowItem.status === 'failed' || borrowItem.data === null) {
		return { status: borrowItem.status, message: 'Borrow item not found', data: null };
	}

	const batch = locals.pb.createBatch();

	batch.collection('stock_item').update(borrowItem.data.stock_item_id, { status: StockItemStatus.USED });
	batch.collection('stock_master').update(borrowItem.data.expand?.stock_item_id.expand.stock_master_id.id, { quantity_available: borrowItem.data.expand?.stock_item_id.expand.stock_master_id.quantity_available + borrowItem.data.quantity, status: StockMasterStatus.ACTIVE });
	batch.collection('borrow_item').update(borrowItemId, { quantity_return: 0 });

	const batchResult = await tryCatch(batch.send());

	if (batchResult.status === 'failed') {
		return { status: batchResult.status, message: 'Error opening disposed stock item', data: batchResult.data };
	} else {
		return { status: batchResult.status, message: 'Disposed stock item opened successfully', data: batchResult.data };
	}
});

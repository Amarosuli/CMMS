import { StockItemStatus, StockMasterStatus } from '$lib/CostumTypes';
import { getRequestEvent, query } from '$app/server';
import { optional, string } from 'valibot';
import { tryCatch } from '$lib/TryCatch';

export interface MovementData {
	id: string;
	partNumber: string;
	description: string;
	batchNumber: string;
	purchaseOrder?: string;
	quantity: number;
	remark?: string;
	created: string;
}

export const GetMaterialMasterOption = query(async () => {
	const { locals } = getRequestEvent();
	const { error, data } = await tryCatch(locals.pb.collection('material_master').getFullList());

	if (error || data.length === 0) {
		return [{ label: 'No Data Found', value: '', detail: 'No Data Found' }];
	}

	return data.map(({ id, code, description, part_number, remark }) => {
		return { label: code, value: id, detail: code + ' - ' + part_number + ' - ' + description + (remark ? ' - ' + remark : '') };
	});
});

export const GetTransactionTypeOption = query(async () => {
	const { locals } = getRequestEvent();
	const { error, data } = await tryCatch(locals.pb.collection('transaction_type').getFullList());

	if (error || data.length === 0) {
		return [{ label: 'No Data Found', value: '', description: '' }];
	}

	return data.map(({ id, code, description }) => {
		return { label: code, value: id, description };
	});
});

export const getRecentStockOut = query(optional(string()), async (filter) => {
	const { locals } = getRequestEvent();
	const { error, data } = await tryCatch(locals.pb.collection('stock_out').getList(1, 10, { filter: filter, expand: 'stock_item_id.stock_master_id.material_master_id', sort: '-created' }));

	if (error || data.items.length === 0) {
		return [] as MovementData[];
	}

	return data.items.map((item) => {
		return {
			id: item.id,
			partNumber: item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.part_number,
			description: item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.description,
			batchNumber: item.expand?.stock_item_id.expand.stock_master_id.batch_number,
			purchaseOrder: item.expand?.stock_item_id.expand.stock_master_id.purchase_order,
			quantity: item.quantity,
			remark: item.remark,
			created: item.created
		} as MovementData;
	});
});

export const getRecentStockIn = query(optional(string()), async (filter) => {
	const { locals } = getRequestEvent();
	const { error, data } = await tryCatch(locals.pb.collection('stock_in').getList(1, 10, { filter: filter, expand: 'material_master_id', sort: '-created' }));

	if (error || data.items.length === 0) {
		return [] as MovementData[];
	}

	return data.items.map((item) => {
		return {
			id: item.id,
			partNumber: item.expand?.material_master_id.part_number,
			description: item.expand?.material_master_id.description,
			batchNumber: item.batch_number,
			purchaseOrder: item.purchase_order,
			quantity: item.quantity,
			remark: item.remark,
			created: item.created
		} as MovementData;
	});
});

export const GetStockOption = query(optional(string()), async (filter) => {
	const { locals } = getRequestEvent();

	const searchFilter = filter ? `(stock_master_id.material_master_id.code ~ "${filter}" || stock_master_id.material_master_id.description ~ "${filter}" || stock_master_id.batch_number ~ "${filter}" || stock_master_id.material_master_id.part_number ~ "${filter}" || label ~ "${filter}")` : '';
	const { error, data } = await tryCatch(locals.pb.collection('stock_item').getList(1, 6, { filter: `(status="NEW" || status ="USED") ${searchFilter ? '&&' + searchFilter : ''}`, expand: 'stock_master_id.material_master_id.material_unit_id' }));

	if (error || data.items.length === 0) {
		return [
			{
				label: 'No Data Found',
				value: '',
				detail: {} as {
					label: string;
					size: number;
					code: string;
					part_number: string;
					description: string;
					remark: string;
					unit: string;
				}
			}
		];
	}

	return data.items.map(({ id, label, size, expand }) => {
		const code: string = expand?.stock_master_id.expand.material_master_id.code || '';
		const description: string = expand?.stock_master_id.expand.material_master_id.description || '';
		const part_number: string = expand?.stock_master_id.expand.material_master_id.part_number || '';
		const remark: string = expand?.stock_master_id.expand.material_master_id.remark || '';
		const unit: string = expand?.stock_master_id.expand.material_master_id.expand.material_unit_id.code || '';

		return {
			label: code,
			value: id,
			detail: { label, size, code, part_number, description, remark, unit } as {
				label: string;
				size: number;
				code: string;
				part_number: string;
				description: string;
				remark: string;
				unit: string;
			}
		};
	});
});

export const cancelStockIn = query(string(), async (stockInId) => {
	const { locals } = getRequestEvent();

	const stockMaster = await tryCatch(locals.pb.collection('stock_master').getFirstListItem(`stock_in_id="${stockInId}"`));

	if (stockMaster.status === 'failed') {
		const deleteStockIn = await tryCatch(locals.pb.collection('stock_in').delete(stockInId));
		return { status: 'success', message: `No stock master found, ${deleteStockIn.status === 'success' ? 'Stock in deleted successfully' : 'Failed to delete stock in'}` };
	}

	const isAlreadyUsed = await tryCatch(locals.pb.collection('borrow_item').getFirstListItem(`stock_item_id.stock_master_id = "${stockMaster.data.id}"`));
	const isAlreadyOut = await tryCatch(locals.pb.collection('stock_out').getFirstListItem(`stock_item_id.stock_master_id = "${stockMaster.data.id}"`));

	if (isAlreadyUsed.data) {
		return { status: 'failed', message: 'Cannot cancel stock in, stock exist in borrowing history. Refference id ' + isAlreadyUsed.data.borrow_movement_id };
	}

	if (isAlreadyOut.data) {
		return { status: 'failed', message: 'Cannot cancel stock in, stock exist in stock out history. Refference id ' + isAlreadyOut.data.id };
	}

	const deleteStockIn = await tryCatch(locals.pb.collection('stock_in').delete(stockInId));
	const deleteStockMaster = await tryCatch(locals.pb.collection('stock_master').delete(stockMaster.data.id));

	if (deleteStockIn.status === 'failed' || deleteStockMaster.status === 'failed') {
		return { status: 'failed', message: 'Failed to cancel stock in' };
	}

	return { status: 'success', message: 'Stock in cancelled successfully' };
});

export const cancelStockOut = query(string(), async (stockOutId) => {
	const { locals } = getRequestEvent();

	const stockOut = await tryCatch(locals.pb.collection('stock_out').getOne(stockOutId, { expand: 'stock_item_id.stock_master_id' }));

	if (stockOut.status === 'failed') {
		return { status: 'failed', message: 'Stock out not found.' };
	}

	// ambil stock_item_id, stock_master_id dan borrow_item_id dari stock out
	const borrowId = stockOut.data.borrow_item_id;
	const stockItemId = stockOut.data.stock_item_id;
	const stockMasterId = stockOut.data.expand?.stock_item_id.expand.stock_master_id.id;
	const stockMasterQtyAvailableBefore = stockOut.data.expand?.stock_item_id.expand.stock_master_id.quantity_available;

	const batch = locals.pb.createBatch();

	// update borrow_item.quantity_return = borrow_item.quantity_out
	if (borrowId) {
		batch.collection('borrow_item').update(borrowId, { quantity_return: stockOut.data.quantity });
		// update stock_item to USED
		batch.collection('stock_item').update(stockItemId, { status: StockItemStatus.USED });
	} else {
		// update stock_item to NEW
		batch.collection('stock_item').update(stockItemId, { status: StockItemStatus.NEW });
	}
	// update stock master quantity_available = quantity_available + stock_item.size and status to ACTIVE
	batch.collection('stock_master').update(stockMasterId, { quantity_available: stockMasterQtyAvailableBefore + stockOut.data.quantity, status: StockMasterStatus.ACTIVE });
	// NOTE: TODO, which better delete or update stock out remark to 'Canceled'
	// batch.collection('stock_out').update(stockOut.data.id, { remark: 'Cancelled' });

	// delete stock out
	batch.collection('stock_out').delete(stockOut.data.id);

	const { status, data, error } = await tryCatch(batch.send());

	if (error) {
		// logger here
		console.error(error);
		return { status, message: 'Error after batch send', data };
	} else {
		return { status, message: 'Stock out cancelled successfully', data };
	}
});

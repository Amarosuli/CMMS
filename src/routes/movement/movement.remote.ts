import { getRequestEvent, query } from '$app/server';
import { optional, string } from 'valibot';
import { tryCatch } from '$lib/TryCatch';

export interface StockMovement {
	id: string;
	quantity: number;
	transactionType: string;
	remark?: string;
	purchaseOrder?: string;
	batchNumber?: string;
	user?: string;
	created: string;
}

type MovementData = {
	id: string;
	partNumber: string;
	description: string;
	batchNumber: string;
	purchaseOrder?: string;
	quantity: number;
	remark?: string;
	created: string;
};

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
		return [{ label: 'No Data Found', value: '' }];
	}

	return data.map(({ id, code, description }) => {
		return { label: code, value: id, description };
	});
});

export const getRecentStockOut = query(optional(string()), async (filter) => {
	const { locals } = getRequestEvent();
	const { error, data } = await tryCatch(locals.pb.collection('stock_out').getList(1, 10, { filter: filter, expand: 'stock_item_id.stock_master_id.material_master_id' }));

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
	const { error, data } = await tryCatch(locals.pb.collection('stock_in').getList(1, 10, { filter: filter, expand: 'material_master_id' }));

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

export const UpdateStockMaster = query(async () => {
	// setelah create data into stock_out
	// update status in stock_item to DISPOSED, storage_id to N/A
	// update quantity_available in stock_master to sync actual quantity
	// if quantity_available in stock_master 0 after sync, update status to INACTIVE
});

import type { StockOut, StockIn } from '$lib/CostumTypes';
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

export const getRecentMovements = query(async () => {
	const { locals } = getRequestEvent();
	const toDay = new Date().toISOString().split('T')[0].split('-');

	const { status: stockInStatus, data: stockIn } = await tryCatch(locals.pb.collection('stock_in').getFullList({ expand: 'user_id', filter: `created<${toDay[0]}-${toDay[1]}-${parseInt(toDay[2]) - 5}` }));
	const { status: stockOutStatus, data: stockOut } = await tryCatch(locals.pb.collection('stock_out').getFullList({ expand: 'stock_id,stock_id.stock_in_id,user_id', filter: `created<"${toDay[0]}-${toDay[1]}-${parseInt(toDay[2]) - 5}"` }));

	let stockInNormalized: StockMovement[] | [] = [];
	let stockOutNormalized: StockMovement[] | [] = [];

	if (stockInStatus === 'success') {
		stockInNormalized = stockIn.map((stock) => {
			return { id: stock.id, quantity: stock.quantity, transactionType: stock.transaction_type, remark: stock.remark, purchaseOrder: stock?.purchase_order, batchNumber: stock.batch_number, user: stock.expand?.user_id.name, created: stock.created };
		});
	}

	if (stockOutStatus === 'success') {
		stockOutNormalized = stockOut.map((stock) => {
			return { id: stock.id, quantity: stock.quantity, transactionType: stock.transaction_type, remark: stock.remark, purchaseOrder: stock.expand?.stock_id.purchase_order, batchNumber: stock.expand?.stock_id.batch_number, user: stock.expand?.user_id?.name, created: stock.created };
		});
	}

	return [...stockInNormalized, ...stockOutNormalized].sort((a, b) => b.created.localeCompare(a.created));
});

export const GetStockOption = query(optional(string()), async (filter) => {
	const { locals } = getRequestEvent();

	const searchFilter = filter ? `(stock_master_id.material_master_id.code ~ "${filter}" || stock_master_id.material_master_id.description ~ "${filter}" || stock_master_id.batch_number ~ "${filter}" || stock_master_id.material_master_id.part_number ~ "${filter}" || identity ~ "${filter}")` : '';
	const { error, data } = await tryCatch(locals.pb.collection('stock_item').getList(1, 6, { filter: `(status="NEW" || status ="USED") ${searchFilter ? '&&' + searchFilter : ''}`, expand: 'stock_master_id.material_master_id.material_unit_id' }));

	if (error || data.items.length === 0) {
		return [
			{
				label: 'No Data Found',
				value: '',
				detail: {} as {
					identity: string;
					quantity: number;
					code: any;
					part_number: any;
					description: any;
					remark: any;
					unit: string;
				}
			}
		];
	}

	return data.items.map(({ id, identity, quantity, expand }) => {
		const code = expand?.stock_master_id.expand.material_master_id.code || '';
		const description = expand?.stock_master_id.expand.material_master_id.description || '';
		const part_number = expand?.stock_master_id.expand.material_master_id.part_number || '';
		const remark = expand?.stock_master_id.expand.material_master_id.remark || '';
		const unit = expand?.stock_master_id.expand.material_master_id.expand.material_unit_id.code || '';

		return { label: code, value: id, detail: { identity, quantity, code, part_number, description, remark, unit } };
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

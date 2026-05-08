import { getRequestEvent, query } from '$app/server';
import { tryCatch } from '$lib/TryCatch';
import { string } from 'valibot';

import type { StockItem, StockMaster } from '$lib/CostumTypes';
import type { ListResult } from 'pocketbase';

export const getStockQuantity = query(string(), async (stockMasterIds) => {
	const { locals } = getRequestEvent();

	const filter = stockMasterIds
		.split(',')
		.map((id) => `id='${id}'`)
		.join('||');

	const { error, data } = await tryCatch(locals.pb.collection('stock_master').getList(1, 20, { filter: filter, expand: 'material_master_id.material_unit_id' }));

	if (error) {
		return { page: 0, perPage: 0, totalItems: 0, totalPages: 0, items: [] } as ListResult<StockMaster>;
	}

	return data;
});

export const getStockByMaterialMasterId = query(string(), async (materialMasterId) => {
	const { locals } = getRequestEvent();

	const { error, data } = await tryCatch(locals.pb.collection('stock_master').getList(1, 20, { filter: `material_master_id='${materialMasterId}'`, expand: 'material_master_id.material_unit_id' }));

	if (error) {
		return { page: 0, perPage: 0, totalItems: 0, totalPages: 0, items: [] } as ListResult<StockMaster>;
	}

	return data;
});

export const getStockMasterById = query(string(), async (id) => {
	const { locals } = getRequestEvent();

	const { error, data } = await tryCatch(locals.pb.collection('stock_master').getOne(id, { expand: 'material_master_id.material_unit_id' }));

	if (error) {
		return {} as StockMaster;
	}

	return data;
});

export const getStockItemByStockMasterId = query(string(), async (stockMasterId) => {
	const { locals } = getRequestEvent();

	const { error, data } = await tryCatch(locals.pb.collection('stock_item').getList(1, 25, { filter: `stock_master_id='${stockMasterId}'`, expand: 'stock_master_id.material_master_id.material_unit_id' }));

	if (error) {
		return { page: 0, perPage: 0, totalItems: 0, totalPages: 0, items: [] } as ListResult<StockItem>;
	}

	return data;
});

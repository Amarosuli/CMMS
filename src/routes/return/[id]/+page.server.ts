import type { MaterialMaster, MaterialUnit, StockItem, StockMaster } from '$lib/CostumTypes.js';
import { tryCatch } from '$lib/TryCatch.js';

export const load = async ({ locals, params }) => {
	const borrowMovementId = params.id;

	const getBorrowMovement = async () => {
		const { status, data, error } = await tryCatch(locals.pb.collection('borrow_movement').getOne(borrowMovementId));

		if (error) {
			return { status, message: error.message, data };
		} else {
			return { status, message: 'Borrow movement found', data };
		}
	};

	const getDetail = async () => {
		const result = await locals.pb.collection('borrow_item').getFullList({ expand: 'stock_item_id.stock_master_id.material_master_id.material_unit_id', filter: `borrow_movement_id='${borrowMovementId}'` });
		return result.map((val) => {
			return {
				...val,
				isReturn: true,
				quantity_return: val.quantity_out,
				stockItem: val.expand?.stock_item_id as StockItem,
				stockMaster: val.expand?.stock_item_id.expand?.stock_master_id as StockMaster,
				materialMaster: val.expand?.stock_item_id.expand?.stock_master_id.expand?.material_master_id as MaterialMaster,
				materialUnit: val.expand?.stock_item_id.expand?.stock_master_id.expand?.material_master_id.expand?.material_unit_id as MaterialUnit
			};
		});
	};

	return {
		borrowMovementData: await getBorrowMovement(),
		detail: await getDetail(),
		borrowMovementId: borrowMovementId
	};
};

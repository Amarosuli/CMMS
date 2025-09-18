import { getRequestEvent, query } from '$app/server';
import { tryCatch } from '$lib/TryCatch';

export interface StockMovement {
	id: string;
	quantity: number;
	transactionType: string;
	remark: string;
	purchaseOrder?: string;
	batchNumber?: string;
	user?: string;
	created: string;
}

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

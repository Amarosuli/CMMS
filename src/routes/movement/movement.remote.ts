import { getRequestEvent, query } from '$app/server';

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
	const stockIn = await locals.pb.collection('stock_in').getFullList({ expand: 'user_id' });
	const stockOut = await locals.pb.collection('stock_out').getFullList({ expand: 'stock_id,stock_id.stock_in_id,user_id' });

	let stockInNormalized: StockMovement[] | [] = [];
	let stockOutNormalized: StockMovement[] | [] = [];

	if (stockIn.length) {
		console.log(stockIn);

		stockInNormalized = stockIn.map((stock) => {
			return { id: stock.id, quantity: stock.quantity, transactionType: stock.transaction_type, remark: stock.remark, purchaseOrder: stock?.purchase_order, batchNumber: stock.batch_number, user: stock.expand?.user_id.name, created: stock.created };
		});
	}

	if (stockOut.length) {
		console.log(stockOut);
		stockOutNormalized = stockOut.map((stock) => {
			return { id: stock.id, quantity: stock.quantity, transactionType: stock.transaction_type, remark: stock.remark, purchaseOrder: stock.expand?.stock_id.purchase_order, batchNumber: stock.expand?.stock_id.batch_number, user: stock.expand?.user_id?.name, created: stock.created };
		});

		return [...stockInNormalized, ...stockOutNormalized];
	}
});

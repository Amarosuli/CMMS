export const load = async ({ locals }) => {
	const getAllStockIn = async () => {
		return await locals.pb.collection('stock_in').getFullList({ expand: 'user_id' });
	};

	const getAllStockOut = async () => {
		return await locals.pb.collection('stock_out').getFullList({ expand: 'stock_id,stock_id.stock_in_id,user_id' });
	};

	return {
		allStockIn: await getAllStockIn(),
		allStockOut: await getAllStockOut()
	};
};

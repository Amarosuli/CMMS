import { getRequestEvent, query } from '$app/server';
import { tryCatch } from '$lib/TryCatch';
import { string } from 'valibot';

export const GetBorrowingReport = query(string(), async (filter?: string) => {
	const { locals } = getRequestEvent();

	const { data, error } = await tryCatch(locals.pb.collection('borrow_report').getFullList({ filter: filter, expand: 'userId,stockId.material_master_id.material_unit_id' }));

	if (error) {
		console.log(error);
		return [];
	}

	return data.map((r) => {
		return {
			id: r.id,
			date: r.borrowDate.split(' ')[0],
			requester: r.expand?.userId.name.split(' ').slice(0, 2).join(' '),
			idNo: r.expand?.userId.username,
			partNumber: r.expand?.stockId.expand?.material_master_id.part_number,
			description: r.expand?.stockId.expand?.material_master_id.description,
			qty: r.qty + ' ' + r.expand?.stockId.expand?.material_master_id.expand?.material_unit_id.code,
			po: r.expand?.stockId.purchase_order,
			bn: r.expand?.stockId.batch_number,
			expiredDate: r.expand?.stockId.expired_date.split(' ')[0],
			condition: r.status,
			orderNumber: r.order_number,
			returned: r.returned
		};
	});
});

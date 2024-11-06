import type { MaterialUnit } from '$lib/components/page/index.js';

export const load = async ({ locals, params }) => {
	let borrowId = params.id;

	const getDetail = async () => {
		const result = await locals.pb.collection('borrow_item').getFullList({ expand: 'stock_id.material_id.unit_id', filter: `borrow_id='${borrowId}'` });
		return result.map((val) => {
			return { ...val, quantity_return: val.quantity_out, stock: val.expand?.stock_id, material: val.expand?.stock_id.expand?.material_id, unit: val.expand?.stock_id.expand?.material_id.expand?.unit_id || ({} as MaterialUnit) };
		});
	};
	return {
		detail: await getDetail(),
		borrowId: borrowId
	};
};

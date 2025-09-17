import type { BorrowMovement, User } from '$lib/CostumTypes.js';
import { tryCatch } from '$lib/TryCatch.js';
export type BorrowMovementExtended = BorrowMovement & {
	user?: User;
	isCheckOut: boolean;
};
export const load = async ({ locals }) => {
	const getOpenBorrowing = async () => {
		const { status, data } = await tryCatch(locals.pb.collection('borrow_movement').getFullList({ filter: 'status="OPEN" || status="PENDING"', expand: 'user_id' }));
		if (status === 'success' && data) {
			return data.map((r): BorrowMovementExtended => {
				return { ...r, user: r.expand?.user_id || undefined, isCheckOut: false };
			});
		} else {
			return [] as BorrowMovementExtended[];
		}
	};
	return {
		openBorrowing: await getOpenBorrowing()
	};
};

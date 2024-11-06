export const load = async ({ locals }) => {
	let userId = locals.user?.id;

	const getActiveBorrow = async () => {
		return await locals.pb.collection('borrow_movement').getFullList({ filter: `user_id='${userId}'&&status='OPEN'` });
	};
	return {
		activeBorrow: await getActiveBorrow()
	};
};

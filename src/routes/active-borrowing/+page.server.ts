export const load = async ({ locals }) => {
	const getOpenBorrowing = async () => {
		const result = await locals.pb.collection('borrow_movement').getFullList({ filter: 'status="OPEN"', expand: 'user_id' });
		return result.map((r) => {
			return { ...r, user: r.expand?.user_id || undefined };
		});
	};
	return {
		openBorrowing: await getOpenBorrowing()
	};
};

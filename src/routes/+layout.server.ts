export const load = async ({ locals }) => {
	return {
		user: locals.pb.authStore.model
	};
};

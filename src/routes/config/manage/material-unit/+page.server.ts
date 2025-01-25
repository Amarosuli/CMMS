import { fail } from '@sveltejs/kit';

export const actions = {
	delete: async ({ locals, request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		if (!id) return fail(401, { message: 'No id provided' });

		try {
			await locals.pb.collection('material_unit').delete(id);
		} catch (er: any) {
			const errorMessage = `${er?.response.message} | PocketBase error.`;
			return fail(er?.status, { message: errorMessage });
		}

		return { message: 'Delete success' };
	}
};

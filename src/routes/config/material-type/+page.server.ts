import { tryCatch } from '$lib/TryCatch.js';
import { fail } from '@sveltejs/kit';

import type { ClientResponseError } from 'pocketbase';

export const actions = {
	delete: async ({ locals, request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		if (!id) return fail(401, { message: 'No id provided' });

		const { error } = await tryCatch<Boolean, ClientResponseError>(locals.pb.collection('material_type').delete(id));

		if (error) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return fail(error.status, { message: errorMessage });
		}

		return { message: 'Delete success' };
	}
};

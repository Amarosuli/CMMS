import { fail, message, superValidate } from 'sveltekit-superforms';
import { getPackageNameById } from '../../package-name.remote';
import { PackageNameSchema } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { tryCatch } from '$lib/TryCatch.js';
import { valibot } from 'sveltekit-superforms/adapters';

import type { ClientResponseError } from 'pocketbase';
import type { PackageName } from '$lib/CostumTypes.js';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		unit: await getPackageNameById(params.id),
		form: await superValidate(valibot(PackageNameSchema))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const form = await superValidate(request, valibot(PackageNameSchema));

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, { form });

		const { error } = await tryCatch<PackageName, ClientResponseError>(locals.pb.collection('package_name').update(id, form.data));
		if (error) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: 500 });
		}

		return message(form, 'Update Successfully!');
	}
};

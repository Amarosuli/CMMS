import { getMaterialUnitOption, getMaterialTypeOption } from '../material-master.remote.js';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { MaterialMasterSchema } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { tryCatch } from '$lib/TryCatch.js';
import { valibot } from 'sveltekit-superforms/adapters';

import type { MaterialMaster } from '$lib/CostumTypes.js';
import type { ClientResponseError } from 'pocketbase';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		materialUnitOption: await getMaterialUnitOption(),
		materialTypeOption: await getMaterialTypeOption(),
		form: await superValidate(valibot(MaterialMasterSchema))
	};
};

export const actions = {
	default: async ({ locals, request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, valibot(MaterialMasterSchema));

		if (!form.valid) {
			if (form.errors?.images) {
				let formx = form;
				formx.errors.images = Object.values(formx.errors.images as Record<string | number, string[]>).flat() as unknown as Record<string | number, string[]>;
				return fail(400, { formx });
			}

			return fail(400, { form });
		}

		const { error } = await tryCatch<MaterialMaster, ClientResponseError>(locals.pb.collection('material_master').create(formData));

		if (error) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: 500 });
		}

		return message(form, 'Create Successfully!');
	}
};

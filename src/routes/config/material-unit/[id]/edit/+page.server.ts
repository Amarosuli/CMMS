import { fail, message, superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';
import { MaterialUnitSchema } from '$lib/valibotSchema.js';
import { getMaterialUnitById } from '../material-unit.remote.js';
import { tryCatch } from '$lib/TryCatch.js';

import type { ClientResponseError } from 'pocketbase';
import type { MaterialUnit } from '$lib/CostumTypes.js';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		unit: await getMaterialUnitById(params.id),
		form: await superValidate(valibot(MaterialUnitSchema))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const form = await superValidate(request, valibot(MaterialUnitSchema));

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, { form });

		const { error } = await tryCatch<MaterialUnit, ClientResponseError>(locals.pb.collection('material_unit').update(id, form.data));
		if (error) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: 500 });
		}

		return message(form, 'Update Successfully!');
	}
};

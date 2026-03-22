import { getMaterialMasterById, getMaterialUnitOption } from '../../material-master.remote.js';
import { fail, message, superValidate, withFiles } from 'sveltekit-superforms';
import { MaterialMasterSchemaView } from '$lib/valibotSchema.js';
import { redirect } from '@sveltejs/kit';
import { valibot } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		id: params.id,
		materialMaster: await getMaterialMasterById(params.id),
		materialUnit: await getMaterialUnitOption(),
		form: await superValidate(valibot(MaterialMasterSchemaView))
	};
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, valibot(MaterialMasterSchemaView));

		// due to spec pocketbase sdk, make sure the field is not include to prevent all data removed
		if (!form.data.images?.length) formData.delete('images');
		if (!form.data.sds) formData.delete('sds');

		let id = params.id;
		if (!id) return message(form, 'id not define', { status: 400 });
		if (!form.valid) return fail(400, withFiles({ form }));

		try {
			await locals.pb.collection('material_master').update(id, formData);
		} catch (error: any) {
			const errorMessage = `${error?.response.message} | PocketBase error.`;
			return message(form, errorMessage, { status: error?.status });
		}

		return message(form, 'Update Successfully!');
	}
};

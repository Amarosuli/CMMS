import { fail, message, superValidate } from 'sveltekit-superforms';
// import { materialMasterSchema } from '$lib/zodSchema';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/'); // Prevent guest users from accessing this page directly.

	return {
		token: locals.pb.authStore.token,
		model: locals.pb.authStore.model
		// form: await superValidate(zod(materialMasterSchema))
	};
};

// export const actions = {
//    default: async ({ locals, request }) => {
//       const form = await superValidate(request, zod(materialMasterSchema));

//       if (!form.valid) return fail(400, { form });

//       try {
//          await locals.pb.collection('material_master').create(form.data);
//       } catch (error: any) {
//          const errorMessage = `${error?.response.message} | PocketBase error.`;
//          return message(form, errorMessage, { status: error?.status });
//       }

//       return message(form, 'Create Successfully!');
//    }
// };

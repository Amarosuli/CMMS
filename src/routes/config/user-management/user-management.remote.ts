import { getRequestEvent, query } from '$app/server';
import { ChangePasswordSchema } from '$lib/valibotSchema';
import { tryCatch } from '$lib/TryCatch';

export const getUserData = query(async () => {
	const { locals, params } = getRequestEvent();

	if (!params.id) return { status: 'failed', data: null, message: 'Id not available' };

	return await tryCatch(locals.pb.collection('users').getOne(params.id));
});

export const changePassword = query(ChangePasswordSchema, async (data) => {
	const { locals, params } = getRequestEvent();

	if (!params.id) return { status: 'failed', data: null, message: 'Id not available' };

	// TODO - Change password currently not available. using email is impossible and the option is using superusers but it means we have to maintain the superusers login first.

	// const { data: userData } = await tryCatch(locals.pb.admins.authWithPassword('', ''));
	// if (userData) {
	// 	return await tryCatch(locals.pb.collection('users').update(params.id, { oldPassword: userData.password, ...data }));
	// }
	return { status: 'failed', data: null, message: '' };
});

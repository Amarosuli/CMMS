import { command, getRequestEvent } from '$app/server';
import { LoginSchema } from '$lib/valibotSchema';
import { tryCatch } from '$lib/TryCatch';

export const logIn = command(LoginSchema, async ({ employeeId, password }) => {
	const { locals } = getRequestEvent();

	const result = await tryCatch(locals.pb.collection('users').authWithPassword(employeeId, password));

	if (result.error) {
		return { status: result.status, message: result.error.message };
	} else {
		return { status: result.status, message: 'Login success' };
	}
});

export const logOut = command(async () => {
	const { locals } = getRequestEvent();

	locals.pb.authStore.clear();
	locals.user = undefined;

	return { status: 'success', message: 'Logout success' };
});

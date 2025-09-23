import { getRequestEvent, query } from '$app/server';
import { tryCatch } from '$lib/TryCatch';
import { string } from 'valibot';

export const getPackageNameById = query(string(), async (id) => {
	if (!id) return { status: 'failed', data: null };

	const { locals } = getRequestEvent();

	return await tryCatch(locals.pb.collection('package_name').getOne(id));
});

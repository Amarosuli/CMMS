import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const { employeeId, password } = await request.json();

	try {
		const result = await locals.pb.collection('users').authWithPassword(employeeId, password);
		locals.user = result.record;
	} catch (error: any) {
		const errorMessage = `${error?.response.message} Crosscheck your ID and Password are typed correctly or make sure your ID already registered.`;
		return json({ status: 400, message: errorMessage });
	}

	return json({ status: 200, message: 'success' });
}

export async function GET({ locals, route }) {
	locals.pb.authStore.clear();
	locals.user = undefined;

	return json({ status: 200, message: 'success' });
}

// Types for the result object with discriminated union
type Success<T> = {
	status: 'success';
	data: T;
	error: null;
};

type Failure<E> = {
	status: 'failed';
	data: null;
	error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
	try {
		const data = await promise;
		return { status: 'success', data, error: null };
	} catch (error) {
		return { status: 'failed', data: null, error: error as E };
	}
}

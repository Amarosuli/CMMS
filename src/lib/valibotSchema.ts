import { nonEmpty, object, optional, pipe, string, trim } from 'valibot';

export const MaterialTypeSchema = object({
	name: pipe(string(), nonEmpty('Please enter the material type name'), trim()),
	description: optional(pipe(string(), trim()))
});

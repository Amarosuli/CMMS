import { nonEmpty, object, optional, pipe, string, trim } from 'valibot';

export const MaterialTypeSchema = object({
	name: pipe(string(), nonEmpty('Please enter the name'), trim()),
	description: optional(pipe(string(), trim()))
});

export const MaterialUnitSchema = object({
	code: pipe(string(), nonEmpty('Please enter the code'), trim()),
	description: pipe(string(), nonEmpty('Please enter the description'), trim())
});

export const PackageNameSchema = object({
	name: pipe(string(), nonEmpty('Please enter the name'), trim()),
	description: optional(pipe(string(), trim()))
});

import { boolean, email, enum_, file, forward, mimeType, minLength, nonEmpty, object, omit, optional, partialCheck, pipe, string, trim, fallback, url, number, check, array, minValue, nullable, maxSize } from 'valibot';
import { UserRole, UserUnit } from './CostumTypes';

export const MaterialTypeSchema = object({
	name: pipe(string(), nonEmpty('Please enter the name'), trim()),
	description: optional(pipe(string(), trim()))
});

export const MaterialUnitSchema = object({
	code: pipe(string(), nonEmpty('Please enter the code'), trim()),
	description: pipe(string(), nonEmpty('Please enter the description'), trim())
});

export const TransactionTypeSchema = MaterialUnitSchema;

export const PackageNameSchema = object({
	name: pipe(string(), nonEmpty('Please enter the name'), trim()),
	description: optional(pipe(string(), trim()))
});

export const MaterialMasterSchema =
	// pipe(
	object({
		code: pipe(string(), nonEmpty('Please enter the code'), trim()),
		description: pipe(string(), nonEmpty('Please enter the description'), trim()),
		part_number: pipe(string(), nonEmpty('Please enter the part number'), trim()),
		minimum_quantity: pipe(number(), minValue(1, 'Minimal quantity is required')),
		images: optional(pipe(array(pipe(file(), mimeType(['image/jpeg', 'image/png'], 'Only JPEG or PNG allowed'), maxSize(1024 * 1024 * 3, 'Maximum size of each image is 3 MB.')), 'One or more images size more than limit'))),
		sds: optional(pipe(file(), mimeType(['application/pdf'], 'Only PDF allowed'), maxSize(1024 * 1024 * 5, 'Please select a pdf smaller than 5 MB.'))),
		remark: optional(pipe(string(), trim())),
		url_reference: optional(pipe(string(), url(), trim())),
		// isPackaged: pipe(nullable(boolean(), false)),
		// package_size: optional(pipe(number())),
		// package_name: optional(pipe(string(), nonEmpty('Please choose the package name'), trim())),
		material_unit_id: pipe(string(), nonEmpty('Please choose the material unit'), trim()),
		material_type_id: optional(pipe(string(), nonEmpty('Please choose the material type'), trim()))
	});
// check((input) => {
// 	if (input.isPackaged && (!input.package_size || !input.package_name)) {
// 		return false;
// 	}
// 	return true;
// }, 'Package size and package name are required when item is packaged')
// );

export const MaterialMasterSchemaView = object({
	...omit(MaterialMasterSchema, ['images', 'sds']).entries,
	images: optional(array(string())),
	sds: optional(string()),
	'images+': optional(pipe(array(pipe(file(), mimeType(['image/jpeg', 'image/png'], 'Only JPEG or PNG allowed'), maxSize(1024 * 1024 * 3, 'Maximum size of each image is 3 MB.')), 'One or more images size more than limit'))),
	'sds+': optional(pipe(file(), mimeType(['application/pdf'], 'Only PDF allowed'), maxSize(1024 * 1024 * 5, 'Please select a pdf smaller than 5 MB.')))
});

export const UserSchema = object({
	username: pipe(string(), nonEmpty('Please enter employee id'), minLength(6, 'Employee id minimal 6 characters'), trim()),
	email: optional(pipe(string(), email(), trim())),
	name: pipe(string(), nonEmpty('Please enter the name'), trim()),
	avatar: optional(pipe(file(), mimeType(['image/jpeg', 'image/png'], 'Only JPEG or PNG allowed'))),
	verified: optional(boolean(), false),
	emailVisibility: optional(boolean(), false),
	unit: enum_(UserUnit, 'Unit is required'),
	role: enum_(UserRole, 'Role is required')
});

export const ChangePasswordSchema = pipe(
	object({
		password: pipe(string(), trim(), minLength(8, 'Password must be at least 8 characters')),
		passwordConfirm: pipe(string(), trim(), minLength(8, 'Password confirm must be at least 8 characters'))
	}),
	forward(
		partialCheck([['password'], ['passwordConfirm']], (input) => input.password === input.passwordConfirm, 'password do not match'),
		['passwordConfirm']
	)
);

export const CreateUserSchema = object({
	...omit(UserSchema, ['verified', 'emailVisibility']).entries,
	...ChangePasswordSchema.entries
});

export const UpdateUserSchema = omit(UserSchema, ['verified', 'emailVisibility']);

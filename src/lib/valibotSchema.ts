import { boolean, email, enum_, file, forward, mimeType, minLength, nonEmpty, object, omit, optional, partialCheck, pipe, string, trim, fallback } from 'valibot';
import { UserRole, UserUnit } from './CostumTypes';

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

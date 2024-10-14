import { z } from 'zod';

export const loginSchema = z.object({
	employeeId: z.string().trim().min(6, 'Employee Id is required, Minimal 6 Characters'),
	password: z.string().trim().min(8, 'Minimal password is 8 Characters')
});

export const materialUnitSchema = z.object({
	code: z.string().trim().min(1, 'Unit code is required'),
	description: z.string().trim()
});

import { z } from 'zod';

export const loginSchema = z.object({
	employeeId: z.string().trim().min(6, 'Employee Id is required, Minimal 6 Characters'),
	password: z.string().trim().min(8, 'Minimal password is 8 Characters')
});

export const materialUnitSchema = z.object({
	code: z.string().trim().min(1, 'Unit code is required'),
	description: z.string().trim()
});

export const materialMasterSchema = z.object({
	code: z.string().trim().min(1, 'Unit code is required'),
	description: z.string().trim(),
	part_number_1: z.string().trim(),
	part_number_2: z.string().trim(),
	part_nubmer_3: z.string().trim(),
	minimum_quantity: z.string().trim(),
	remark: z.string().trim().optional(),
	unit_id: z.string().trim().uuid('Only UUID')
});

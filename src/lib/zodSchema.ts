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
	code: z.string().trim().min(1, 'Material code is required'),
	description: z.string().trim().min(5, 'You should put the description of this material'),
	part_number: z.string().trim().min(1, 'Part number is required'),
	minimum_quantity: z.number({ message: 'Accept number only' }).min(1, 'Minimal quantity is required'),
	remark: z.string().trim().optional(),
	unit_id: z.string().trim().min(1, 'You have to choose the unit of material')
});

export enum borrowMovementStatus {
	OPEN = 'OPEN',
	PENDING = 'PENDING',
	CLOSED = 'CLOSED'
}

export const stockInSchema = z.object({
	transaction_type: z.string().trim().min(1, 'Transaction Type is required'),
	material_id: z.string().trim().min(1, 'Material is required'),
	purchase_order: z.string().trim().optional(),
	batch_number: z.string().trim().min(1, 'Batch Number is required'),
	quantity: z.number().min(1, 'Quantity is required, at least 1'),
	expired_date: z.string({ message: 'Expired date is required' }).transform((str: string) => new Date(str).toUTCString()),
	user_id: z.string().trim().min(1, 'User is required'),
	remark: z.string().trim().optional()
});

import { z } from 'zod';
import { BorrowStatus, UserUnit, UserRole } from './CostumTypes';

export const loginSchema = z.object({
	employeeId: z.string().trim().min(6, 'Employee Id is required, Minimal 6 Characters'),
	password: z.string().trim().min(8, 'Minimal password is 8 Characters')
});

export const userSchema = z.object({
	username: z.string().trim().min(6, 'Employee Id is required, Minimal 6 Characters'),
	email: z.string().email().optional(),
	name: z.string().min(1, 'Name is required'),
	unit: z.nativeEnum(UserUnit, { required_error: 'Unit is required' }),
	role: z.nativeEnum(UserRole, { required_error: 'Role is required' }),
	password: z.string().trim().min(8, 'Password is required, Minimal 8 Characters'),
	passwordConfirm: z.string().trim().min(8, 'Password is required, Minimal 8 Characters')
});

export const materialUnitSchema = z.object({
	code: z.string().trim().min(1, 'Unit code is required'),
	description: z.string().trim()
});

export const materialGroupSchema = z.object({
	name: z.string().trim().min(1, 'Group name is required'),
	description: z.string().trim()
});

export const materialMasterSchema = z.object({
	code: z.string().trim().min(1, 'Material code is required'),
	description: z.string().trim().min(5, 'You should put the description of this material'),
	part_number: z.string().trim().min(1, 'Part number is required'),
	minimum_quantity: z.number({ message: 'Accept number only' }).min(1, 'Minimal quantity is required'),
	remark: z.string().trim().optional(),
	unit_id: z.string().trim().min(1, 'You have to choose the unit of material'),
	images: z
		.instanceof(File)
		.refine((f) => f.size < 3_000_000, 'Max 3 MB upload images.')
		.array()
		.optional()
		.nullable(),
	sds: z
		.instanceof(File)
		.refine((f) => f.size < 5_000_000, 'Max 5 MB upload files')
		.optional()
		.nullable(),
	url_refference: z.string().optional(),
	group_id: z.string().trim().optional()
});

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

export const stockOutSchema = z.object({
	transaction_type: z.string().trim().min(1, 'Transaction Type is required'),
	stock_id: z.string().trim().min(1, 'Stock Master is required'),
	quantity: z.number().min(1, 'Quantity is required, at least 1'),
	user_id: z.string().trim().min(1, 'User is required'),
	remark: z.string().trim().optional(),
	refference_id: z.string().trim().optional()
});

export const borrowingSchema = z.object({
	user_id: z.string().trim().min(1, 'User is required'),
	order_number: z.string().trim().optional(),
	esn: z.string().trim().optional(),
	status: z.nativeEnum(BorrowStatus)
});

export const borrowItemSchema = z.object({
	items: z
		.object({
			borrow_id: z.string().trim().min(1, 'Borrow id is required'),
			stock_id: z.string().trim().min(1, 'Stock Master is required'),
			quantity_out: z.number().min(1, 'Out quantity is required, at least 1'),
			quantity_return: z.number().optional(),
			date_out: z
				.string({ message: 'Date out is required' })
				.transform((str: string) => new Date(str).toUTCString())
				.optional(),
			date_return: z
				.string({ message: 'Date return is required' })
				.transform((str: string) => new Date(str).toUTCString())
				.optional()
		})
		.array()
		.default([{ borrow_id: '', stock_id: '', quantity_out: 1, quantity_return: 0, date_out: new Date().toUTCString() }])
});

export const borrowItemOutSchema = z.object({
	items: z
		.object({
			borrow_id: z.string().trim().min(1, 'Borrow id is required'),
			stock_id: z.string().trim().min(1, 'Stock Master is required'),
			quantity_out: z.number().min(1, 'Out quantity is required, at least 1'),
			quantity_return: z.number().optional(),
			date_out: z.string({ message: 'Date out is required' }).transform((str: string) => new Date(str).toUTCString())
		})
		.array()
		.default([{ borrow_id: '', stock_id: '', quantity_out: 1, date_out: new Date().toUTCString() }])
});

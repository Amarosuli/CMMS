import PocketBase, { RecordService, type RecordModel } from 'pocketbase';

export interface MaterialMaster extends RecordModel {
	code: string;
	description: string;
	part_number_1: string;
	part_number_2: string;
	part_number_3: string;
	minimum_quantity: string;
	remark: string;
	unit_id: MaterialUnit['id'];
	expand?: {
		unit_id: MaterialUnit;
	};
	unitCode: string;
}

export interface MaterialUnit extends RecordModel {
	code: string;
	description: string;
}

export interface TransactionType extends RecordModel {
	code: string;
	description: string;
}

export interface User extends RecordModel {
	username: string; // as employee_id
	email: string;
	name: string;
	avatar: string;
	role: string;
	unit: string;
}

export interface StockMaster extends RecordModel {
	material_id: MaterialMaster['id'];
	quantity_available: number;
	batch_number: string;
	expand?: {
		material_id: MaterialMaster;
	};
}

export interface StockMovement extends RecordModel {
	material_id: MaterialMaster['id'];
	transaction_type_id: TransactionType['id'];
	order_number: string;
	engine_serial_number: string;
	batch_number: string;
	quantity: number;
	user_id: User['id'];
	remark: string;
	expand?: {
		material_id: MaterialMaster;
		transaction_type_id: TransactionType;
		user_id: User;
	};
}

export interface TypedPocketBase extends PocketBase {
	collection(idOrName: string): RecordService;
	collection(idOrName: 'users'): RecordService<User>;
	collection(idOrName: 'material_unit'): RecordService<MaterialUnit>;
	collection(idOrName: 'material_master'): RecordService<MaterialMaster>;
	collection(idOrName: 'stock_master'): RecordService<StockMaster>;
}

export type FileUrlOption = {
	download?: boolean;
	thumb?: string;
};

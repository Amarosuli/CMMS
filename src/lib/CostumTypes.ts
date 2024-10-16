import PocketBase, { RecordService, type RecordModel } from 'pocketbase';

export interface MaterialMaster extends RecordModel {
	code: string;
	description: string;
	part_number: string;
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
	role: 'Admin' | 'General' | 'Super';
	unit: string;
}

enum StockMasterStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE'
}

export interface StockMaster extends RecordModel {
	batch_number: string;
	purchase_order: string;
	quantity_available: number;
	expired_date: string;
	material_id: MaterialMaster['id'];
	storage_id: string;
	status: StockMasterStatus;
	stock_in_id: StockIn['id'];
	expand?: {
		material_id: MaterialMaster;
		stock_in_id: StockIn;
	};
}

export interface StockIn extends RecordModel {
	transaction_type: TransactionType['code'];
	material_id: MaterialMaster['id'];
	purchase_order: string;
	batch_number: string;
	quantity: number;
	expired_date: string;
	user_id: User['id'];
	remark: string;
	expand?: {
		material_id: MaterialMaster;
		user_id: User;
	};
}

export interface StockOut extends RecordModel {
	transaction_type: TransactionType['code'];
	stock_id: StockMaster['id'];
	quantity: number;
	user_id: User['id'];
	remark: string;
	refference_id: string;
}

export interface TypedPocketBase extends PocketBase {
	collection(idOrName: string): RecordService;
	collection(idOrName: 'users'): RecordService<User>;
	collection(idOrName: 'material_unit'): RecordService<MaterialUnit>;
	collection(idOrName: 'material_master'): RecordService<MaterialMaster>;
	collection(idOrName: 'stock_master'): RecordService<StockMaster>;
	collection(idOrName: 'stock_in'): RecordService<StockIn>;
	collection(idOrName: 'stock_out'): RecordService<StockOut>;
}

export type FileUrlOption = {
	download?: boolean;
	thumb?: string;
};

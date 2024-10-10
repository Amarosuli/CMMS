import PocketBase, { RecordService, type RecordModel } from 'pocketbase';

export interface MaterialMaster extends RecordModel {
	code: string;
	description: string;
	part_number_1: string;
	part_number_2: string;
	part_number_3: string;
	minimum_quantity: string;
	remark: string;
	expand: {
		unit_id: MaterialUnit;
	};
	unitCode: string;
	unit_id: MaterialUnit['id'];
}

export interface MaterialUnit extends RecordModel {
	code: string;
	description: string;
}

export interface User extends RecordModel {
	username: string;
	email: string;
	name: string;
	avatar: string;
	employee_id: string;
	role: string;
	unit: string;
}

export interface TypedPocketBase extends PocketBase {
	collection(idOrName: string): RecordService;
	collection(idOrName: 'users'): RecordService<User>;
	collection(idOrName: 'material_unit'): RecordService<MaterialUnit>;
	collection(idOrName: 'material_master'): RecordService<MaterialMaster>;
}

export type FileUrlOption = {
	download?: boolean;
	thumb?: string;
};

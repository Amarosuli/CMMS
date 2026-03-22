import type { MaterialMasterView } from '$lib/CostumTypes';
import { getRequestEvent, query } from '$app/server';
import { tryCatch } from '$lib/TryCatch';
import { string } from 'valibot';

export const getMaterialUnitOption = query(async () => {
	const { locals } = getRequestEvent();

	const { error, data } = await tryCatch(locals.pb.collection('material_unit').getFullList());

	if (error || data.length === 0) {
		return [{ label: 'No Data Found', value: '' }];
	}

	return data.map(({ id, code, description }) => {
		return { label: code + ' - ' + description, value: id };
	});
});

export const getMaterialTypeOption = query(async () => {
	const { locals } = getRequestEvent();

	const { error, data } = await tryCatch(locals.pb.collection('material_type').getFullList());

	if (error || data.length === 0) {
		return [{ label: 'No Data Found', value: '' }];
	}

	return data.map(({ id, name, description }) => {
		return { label: name + ' - ' + description, value: id };
	});
});

export const getPackageNameOption = query(async () => {
	const { locals } = getRequestEvent();

	const { error, data } = await tryCatch(locals.pb.collection('package_name').getFullList());

	if (error || data.length === 0) {
		return [{ label: 'No Data Found', value: '' }];
	}

	return data.map(({ id, name }) => {
		return { label: name, value: id };
	});
});

export const getMaterialMasterById = query(string(), async (id) => {
	if (!id) return { status: 'failed', data: null };

	const { locals } = getRequestEvent();

	return await tryCatch(locals.pb.collection('material_master').getOne<MaterialMasterView>(id, { expand: 'material_unit_id,material_type_id' }));
});

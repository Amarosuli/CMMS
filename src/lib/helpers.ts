import { derived, writable, type Readable, type Writable } from 'svelte/store';
import { pb } from './pocketbaseClient';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import ID from 'dayjs/locale/id';

import type { MaterialMaster, TypedPocketBase, MaterialUnit, User } from './CostumTypes';
import type { RecordListOptions, RecordModel, RecordService } from 'pocketbase';

export const getFirstPath = (s: string): string => {
	const pattern = /\/(\w+)\/\w+/;
	const result = s.match(pattern);
	return result ? `/${result[1]}` : '/';
};

class PageFile<T> {
	private api!: RecordService<T>;
	private options?: RecordListOptions;

	private _page: number = 1;
	private _perPage: number = 6;
	private _hasNextPage: boolean = false;
	private _hasPrevPage: boolean = false;

	private items: Writable<T[]> = writable([]);
	private currentPage: Writable<number> = writable(1);
	private perPage: Writable<number> = writable(6);
	private totalPages: Writable<number> = writable(1);
	private isLoading: Writable<boolean> = writable(false);
	private hasPrevPage: Writable<boolean> = writable(false);
	private hasNextPage: Writable<boolean> = writable(false);
	private modifier: Function[] = [];

	getState: () => {
		currentPage: Readable<number>;
		totalPages: Readable<number>;
		perPage: Readable<number>;
		items: Readable<T[]>;
		hasPrevPage: Readable<boolean>;
		hasNextPage: Readable<boolean>;
		isLoading: Readable<boolean>;
	};
	reload: () => void;
	nextPage: () => void;
	prevPage: () => void;
	setPerPage: (number: number) => void;
	addModifier: (f: Function) => void;

	constructor(api: RecordService<T>, options?: RecordListOptions) {
		this.api = api;
		this.options = options;

		this.getState = () => {
			this.loadData();
			return {
				currentPage: derived(this.currentPage, ($currentPage) => $currentPage),
				totalPages: derived(this.totalPages, ($totalPages) => $totalPages),
				perPage: derived(this.perPage, ($perPage) => $perPage),
				items: derived(this.items, ($items) => {
					if (this.modifier.length) {
						let final: T[] = [];
						this.modifier.forEach((_f) => {
							final = _f($items);
						});
						return final;
					} else {
						return $items;
					}
				}),
				hasPrevPage: this.hasPrevPage,
				hasNextPage: this.hasNextPage,
				isLoading: this.isLoading
			};
		};

		this.addModifier = (f) => {
			this.modifier.push(f);
		};

		this.reload = () => {
			this.loadData();
		};

		this.nextPage = () => {
			if (!this._hasNextPage) return;
			this._page += 1;
			this.loadData();
		};

		this.prevPage = () => {
			if (!this._hasPrevPage) return;
			this._page -= 1;
			this.loadData();
		};
		this.setPerPage = (number) => {
			this._perPage = number;
		};
	}

	private async loadData() {
		this.isLoading.update((v) => true);
		let result = await this.api.getList(this._page, this._perPage, this.options);

		this.items.update((v) => result.items);
		this.currentPage.update((v) => result.page);
		this.perPage.update((v) => result.perPage);
		this.totalPages.update((v) => result.totalPages);

		this._page = result.page;

		if (result.page < result.totalPages) {
			this.hasNextPage.update((v) => true);
			this._hasNextPage = true;
		} else {
			this.hasNextPage.update((v) => false);
			this._hasNextPage = false;
		}
		if (result.page != 1 && result.page <= result.totalPages) {
			this.hasPrevPage.update((v) => true);
			this._hasPrevPage = true;
		} else {
			this.hasPrevPage.update((v) => false);
			this._hasPrevPage = false;
		}

		this.isLoading.update((v) => false);
	}
}

export class Client {
	private pb: TypedPocketBase;

	constructor() {
		this.pb = pb;
	}

	init<T = RecordModel>(idOrName: string, options?: RecordListOptions): PageFile<T> {
		return new PageFile<T>(this.pb.collection(idOrName), options);
	}
}

export interface TypedClient extends Client {
	init(idOrName: string, options?: RecordListOptions): PageFile<RecordModel>;
	init(idOrName: 'material_unit', options?: RecordListOptions): PageFile<MaterialUnit>;
	init(idOrName: 'material_master', options?: RecordListOptions): PageFile<MaterialMaster>;
	init(idOrName: 'users', options?: RecordListOptions): PageFile<User>;
}

export const createPageFile = () => {
	return new Client() as TypedClient;
};

type TimeOption = {
	format: string;
};
export const time = (date: any, options?: TimeOption) => {
	if (options) return dayjs(date).locale(ID).format(options.format);
	return dayjs(date).locale(ID).format('dddd, DD MMMM YYYY - h:mm A');
};

export const timeOfDay = () => {
	dayjs.extend(isBetween);

	let morning = [dayjs().hour(0).minute(0).second(0), dayjs().hour(12).minute(0).second(0)];
	let afternoon = [dayjs().hour(12).minute(0).second(0), dayjs().hour(17).minute(0).second(0)];
	let evening = [dayjs().hour(17).minute(0).second(0), dayjs().hour(20).minute(0).second(0)];
	let night = [dayjs().hour(20).minute(0).second(0), dayjs().hour(23).minute(0).second(0)];

	let isMorning = dayjs().isBetween(morning[0], morning[1]);
	let isAfternoon = dayjs().isBetween(afternoon[0], afternoon[1]);
	let isEvening = dayjs().isBetween(evening[0], evening[1]);
	let isNight = dayjs().isBetween(night[0], night[1]);

	if (isMorning) return 'Morning';
	if (isAfternoon) return 'Afternoon';
	if (isEvening) return 'Evening';
	if (isNight) return 'Night';
};

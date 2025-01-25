import type { RecordListOptions, RecordModel } from 'pocketbase';
import type { CollectionParam } from './CostumTypes';
import { pb } from './pocketbaseClient';

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	return function (this: any, ...args: Parameters<T>) {
		timeoutId ?? clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
}

export type PageFile = ReturnType<typeof createPageFile>;

export const createPageFile = (config: { collectionName: CollectionParam; perPage?: number; options?: RecordListOptions }) => {
	let items: RecordModel[] = $state([] as unknown as RecordModel[]);
	let isLoading: boolean = $state(false);
	let currentPage: number = $state(1);
	let totalPages: number = $state(0);
	let totalItems: number = $state(0);
	let perPage: number = $state(config.perPage || 5);
	let hasPrev: boolean = $derived(currentPage !== 1);
	let hasNext: boolean = $derived.by(() => {
		if (currentPage === totalPages) {
			return false;
		} else if (currentPage === 1) {
			return true;
		} else {
			return true;
		}
	});
	let modifier: Function[] = [];
	let options: RecordListOptions = $state({ ...config.options, sort: '-created' });
	let sortBucket: string = $state('');
	let sortDirection: string = $state<'dsc' | 'asc'>('dsc');

	const sort = (column?: string) => {
		if (column === sortBucket) {
			sortDirection = sortDirection === 'dsc' ? 'asc' : 'dsc';
		} else {
			sortBucket = column || 'created';
			sortDirection = 'dsc';
		}

		let direction: '-' | '' = sortDirection === 'asc' ? '' : sortDirection === 'dsc' ? '-' : '';

		options = { ...options, sort: `${direction}${column?.toLowerCase()}` };
		debounce(load, 400)();
	};

	const next = () => {
		if (currentPage === totalPages) return;
		currentPage++;
		debounce(load, 400)();
	};

	const prev = () => {
		if (currentPage === 1) return;
		currentPage--;
		debounce(load, 400)();
	};

	const addModifier: (f: (items: RecordModel[]) => void) => void = (f) => {
		modifier.push(f);
	};

	const load = () => {
		isLoading = true;
		pb.collection(config.collectionName)
			.getList(currentPage, perPage, options)
			.then((res) => {
				totalPages = res.totalPages;
				totalItems = res.totalItems;
				if (modifier.length) {
					let final: RecordModel[] = [];
					modifier.forEach((f) => {
						final = f(res.items);
					});
					items = final;
				} else {
					items = res.items;
				}
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				isLoading = false;
			});
	};

	return {
		get items() {
			return items;
		},
		get currentPage() {
			return currentPage;
		},
		get isLoading() {
			return isLoading;
		},
		get hasNext() {
			return hasNext;
		},
		get hasPrev() {
			return hasPrev;
		},
		get totalItems() {
			return totalItems;
		},
		get totalPages() {
			return totalPages;
		},
		get perPage() {
			return perPage;
		},
		reload: () => {
			isLoading = true;
			load();
		},
		addModifier,
		load,
		next,
		prev,
		sort
	};
};

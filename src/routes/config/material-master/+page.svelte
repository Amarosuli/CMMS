<script lang="ts">
	import type { RecordModel } from 'pocketbase';

	import { type ColumnDef, type VisibilityState, getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
	import { createSvelteTable, renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
	import { DataTableActions, DataTableSortColumn, SuperTable } from '$lib/components/costum';
	import { createRawSnippet, onMount } from 'svelte';
	import { createPageFile } from '$lib/PageTable.svelte';
	import { ChevronLeft } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/state';

	let { data } = $props();
	const { user } = data;

	const pageFile = createPageFile({
		collectionName: 'material_master',
		perPage: 10,
		options: { expand: 'unit_id' }
	});
	pageFile.addModifier((items: any[]) => {
		return items.map((val) => {
			return { ...val, unitCode: val.expand ? val.expand.unit_id.code : 'N/A', part_number: val.part_number ? val.part_number : '-' };
		});
	});

	export const columns: ColumnDef<RecordModel>[] = [
		{
			accessorKey: 'code',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Code',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>((getData) => {
					const code = getData();
					return {
						render: () => `<div class="capitalize">${code}</div>`
					};
				});
				return renderSnippet(Snippet, row.getValue('code'));
			}
		},
		{
			accessorKey: 'description',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Description',
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					disabled: pageFile.isLoading,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => row.getValue('description')
		},
		{
			accessorKey: 'part_number',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Part Number',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => row.getValue('part_number')
		},
		{
			accessorKey: 'unitCode',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Unit',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'unit_id' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('unit_id')
				}),
			cell: ({ row }) => row.getValue('unitCode')
		},
		{
			accessorKey: 'minimum_quantity',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Minimum Quantity',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => row.getValue('minimum_quantity')
		},
		{
			accessorKey: 'remark',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Remark',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => row.getValue('remark')
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, { id: row.original.id, basePath: page.url.pathname, user, reload: pageFile.reload });
			}
		}
	];

	let columnVisibility = $state<VisibilityState>({});

	const table = createSvelteTable({
		get data() {
			return pageFile.items;
		},
		columns,
		state: {
			get columnVisibility() {
				return columnVisibility;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		}
	});

	onMount(() => {
		pageFile.load();
	});

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');
</script>

<svelte:head>
	<title>CMMS - Material Master</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Config</span>
	</Button>
</div>

<SuperTable config={{ tableName: 'Material Master' }} {table} {pageFile} {columns} />

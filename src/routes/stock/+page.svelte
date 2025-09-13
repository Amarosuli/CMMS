<script lang="ts">
	import type { RecordModel } from 'pocketbase';

	import { type ColumnDef, type VisibilityState, getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
	import { createSvelteTable, renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
	import { DataTableActions, DataTableSortColumn, SuperTable, ViewQr } from '$lib/components/costum';
	import { createRawSnippet, onMount } from 'svelte';
	import { createPageFile } from '$lib/PageTable.svelte';
	import { page } from '$app/state';
	import ViewBarcode from '$lib/components/costum/ViewBarcode.svelte';

	let { data } = $props();
	const { user } = data;

	const pageFile = createPageFile({
		collectionName: 'stock_master',
		perPage: 10,
		options: { expand: 'material_id,material_id.unit_id' }
	});

	pageFile.addModifier((items: any[]) => {
		return items.map((val) => {
			return { ...val, materialData: val.expand ? val.expand.material_id : 'N/A' };
		});
	});

	export const columns: ColumnDef<RecordModel>[] = [
		{
			id: 'material_description',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Material Description',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'material_id.description' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('material_id.description')
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>(() => {
					const data = row.original.expand?.material_id.description.toLowerCase();
					return {
						render: () => `<div class="capitalize">${data}</div>`
					};
				});
				return renderSnippet(Snippet, row.getValue('material_description'));
			}
		},
		{
			accessorKey: 'batch_number',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Batch Number',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>((getData) => {
					const data = getData();
					return {
						render: () => `<div class="capitalize">${data}</div>`
					};
				});
				return renderSnippet(Snippet, row.getValue('batch_number'));
			}
		},
		{
			id: 'quantity available',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Available Quantity',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'quantity_available' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('quantity_available')
				}),
			cell: ({ row }) => {
				let materialUnit = row.original.materialData?.expand?.unit_id?.code || 'EA';
				return row.original.quantity_available + ' ' + materialUnit;
			}
		},
		{
			id: 'QR',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Barcode',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined
				}),
			cell: ({ row }) => {
				return renderComponent(ViewBarcode, { data: row.original });
			}
		},
		{
			id: 'Quantity Borrowed',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Quantity Borrowed',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'quantity_borrowed' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('quantity_borrowed')
				}),
			cell: ({ row }) => {
				let materialUnit = row.original.materialData?.expand?.unit_id?.code || 'EA';
				return row.original.quantity_borrowed + ' ' + materialUnit;
			}
		},
		{
			accessorKey: 'code',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Code',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'material_id.code' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('material_id.code')
				}),
			cell: ({ row }) => {
				return row.original.materialData.code;
			}
		},
		{
			accessorKey: 'description',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Description',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => row.getValue('description')
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, { id: row.original.id, basePath: page.url.pathname, user, disableDelete: true });
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
</script>

<svelte:head>
	<title>CMMS - Stock Available</title>
</svelte:head>

<SuperTable config={{ tableName: 'Stock Available', addUrl: '/movement/stock-in' }} {table} {pageFile} {columns} />

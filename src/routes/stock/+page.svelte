<script lang="ts">
	import { type ColumnDef, type VisibilityState, getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
	import { createSvelteTable, renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { DataTableActions, DataTableSortColumn, ExportWidget, SuperTable, ViewBarcode } from '$lib/components/costum';
	import { createRawSnippet, onMount } from 'svelte';
	import { createPageFile } from '$lib/PageTable.svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data } = $props();
	const { user } = data;

	const pageFile = createPageFile({
		collectionName: 'stock_master',
		perPage: 10,
		// svelte-ignore state_referenced_locally
		options: { expand: 'material_id,material_id.unit_id', filter: 'status="ACTIVE"' }
	});

	pageFile.addModifier((items: any[]) => {
		return items.map((val) => {
			return { ...val, materialData: val.expand ? val.expand.material_id : 'N/A' };
		});
	});

	export const columns: ColumnDef<(typeof pageFile)['items'][number]>[] = [
		{
			accessorKey: 'material_id.description',
			id: 'Description',
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
				return renderSnippet(Snippet);
			}
		},
		{
			accessorKey: 'material_id.part_number',
			id: 'Part Number',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Part Number',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'material_id.part_number' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('material_id.part_number')
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>(() => {
					const data = row.original.expand?.material_id.part_number.toLowerCase();
					return {
						render: () => `<div class="uppercase">${data}</div>`
					};
				});
				return renderSnippet(Snippet);
			}
		},
		{
			accessorKey: 'batch_number',
			id: 'Batch Number',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Batch Number',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => {
				return row.original.batch_number;
			}
		},
		{
			accessorKey: 'quantity_available',
			id: 'Quantity Available',
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
			id: 'Barcode',
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
			accessorKey: 'quantity_borrowed',
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
			accessorKey: 'material_id.code',
			id: 'Code',
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

	let toggleFilter = $state('');

	function changeFilter() {
		if (toggleFilter === '1') {
			pageFile.setFilter('status="INACTIVE"');
		} else if (toggleFilter === '2') {
			pageFile.setFilter('status="ACTIVE"||status="INACTIVE"');
		} else {
			pageFile.setFilter('');
		}
		pageFile.reload();
	}
</script>

<svelte:head>
	<title>CMMS - Stock Available</title>
</svelte:head>

<SuperTable config={{ tableName: 'Stock Available', addUrl: '/movement/stock-in' }} {table} {pageFile} {columns}>
	<ToggleGroup.Root class="hidden lg:block" variant="outline" type="single" bind:value={toggleFilter} onValueChange={changeFilter}>
		<ToggleGroup.Item value="1" aria-label="Toggle bold">
			<p class="px-5">Inactive</p>
		</ToggleGroup.Item>
		<ToggleGroup.Item value="2" aria-label="Toggle italic">
			<p class="px-5">All</p>
		</ToggleGroup.Item>
	</ToggleGroup.Root>
	<ExportWidget {pageFile} />
</SuperTable>

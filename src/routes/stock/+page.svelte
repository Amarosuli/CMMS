<script lang="ts">
	// import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { type ColumnDef, type VisibilityState, getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
	import { DataTableActions, DataTableSortColumn, ExportWidget, SuperTable, ViewAllStockQuantity } from '$lib/components/costum';
	import { createSvelteTable, renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
	import { createRawSnippet, onMount } from 'svelte';
	import { createPageFile } from '$lib/PageTable.svelte';
	import { page } from '$app/state';

	let { data } = $props();
	const { user } = $derived(data);

	const pageFile = createPageFile({
		collectionName: 'stock_overview',
		perPage: 10,
		options: { expand: 'material_unit_id' }
	});

	export const columns: ColumnDef<(typeof pageFile)['items'][number]>[] = [
		{
			accessorKey: 'description',
			id: 'Description',
			header: () =>
				renderComponent(DataTableSortColumn, {
					text: 'Material Description',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'description' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('description')
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>(() => {
					const data = row.original.description;
					return {
						render: () => `<div class="capitalize w-40 text-wrap">${data}</div>`
					};
				});
				return renderSnippet(Snippet);
			}
		},
		{
			accessorKey: 'part_number',
			id: 'Part Number',
			header: () =>
				renderComponent(DataTableSortColumn, {
					text: 'Part Number',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'part_number' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('part_number')
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>(() => {
					const data = row.original.part_number.toLowerCase();
					return {
						render: () => `<div class="uppercase">${data}</div>`
					};
				});
				return renderSnippet(Snippet);
			}
		},
		{
			accessorKey: 'batches',
			id: 'Batch Numbers',
			header: () =>
				renderComponent(DataTableSortColumn, {
					text: 'Batch Numbers',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'batches' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('batches')
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>(() => {
					const data = row.original.batches.toString(); // should make sure it's a string, so split method can be applied without errors
					return {
						render: () => `<div class="capitalize w-40 text-wrap">${data.split(',').join(', ')}</div>`
					};
				});
				return renderSnippet(Snippet);
			}
		},
		{
			accessorKey: 'total_quantity',
			id: 'Total Quantity',
			header: () =>
				renderComponent(DataTableSortColumn, {
					text: 'Total Quantity',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === 'total_quantity' ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort('total_quantity')
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>(() => {
					const data = row.original.total_quantity; // should make sure it's a string, so split method can be applied without errors
					return {
						render: () => `<div class="capitalize w-40 text-wrap">${data} ${row.original.expand?.material_unit_id.code}</div>`
					};
				});
				return renderSnippet(Snippet);
			}
		},
		{
			header: 'Detail',
			cell: ({ row }) => {
				return renderComponent(ViewAllStockQuantity, { data: row.original });
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

	// let toggleFilter = $state('');

	// function changeFilter() {
	// 	if (toggleFilter === '1') {
	// 		pageFile.setFilter('status="INACTIVE"');
	// 	} else if (toggleFilter === '2') {
	// 		pageFile.setFilter('status="ACTIVE"||status="INACTIVE"');
	// 	} else {
	// 		pageFile.setFilter('');
	// 	}
	// 	pageFile.reload();
	// }
</script>

<svelte:head>
	<title>CMMS - Stock Available</title>
</svelte:head>

<SuperTable config={{ tableName: 'Stock Available', addUrl: '/movement/stock-in' }} {table} {pageFile} {columns}>
	<!-- <ToggleGroup.Root class="hidden lg:block" variant="outline" type="single" bind:value={toggleFilter} onValueChange={changeFilter}>
		<ToggleGroup.Item value="1" aria-label="Toggle bold">
			<p class="px-5">Inactive</p>
		</ToggleGroup.Item>
		<ToggleGroup.Item value="2" aria-label="Toggle italic">
			<p class="px-5">All</p>
		</ToggleGroup.Item>
	</ToggleGroup.Root> -->
	<ExportWidget {pageFile} />
</SuperTable>

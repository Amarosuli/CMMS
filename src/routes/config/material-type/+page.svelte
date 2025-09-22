<script lang="ts">
	import { type ColumnDef, type VisibilityState, getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
	import { createSvelteTable, renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
	import { DataTableActions, DataTableSortColumn, SuperTable } from '$lib/components/costum';
	import { createRawSnippet, onMount } from 'svelte';
	import { createPageFile } from '$lib/PageTable.svelte';
	import { ChevronLeft } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/state';

	let { data } = $props();
	const { user } = data;

	const pageFile = createPageFile({
		collectionName: 'material_type',
		perPage: 10
	});

	export const columns: ColumnDef<(typeof pageFile)['items'][number]>[] = [
		{
			accessorKey: 'name',
			id: 'Name',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Name',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>(() => {
					const name = row.original.name;
					return {
						render: () => `<div class="capitalize">${name.toLowerCase()}</div>`
					};
				});
				return renderSnippet(Snippet);
			}
		},
		{
			accessorKey: 'description',
			id: 'Description',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Description',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => row.original.description || '-'
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
	<title>CMMS - Material Type</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Config</span>
	</Button>
</div>

<SuperTable config={{ tableName: 'Material Type' }} {table} {pageFile} {columns} />

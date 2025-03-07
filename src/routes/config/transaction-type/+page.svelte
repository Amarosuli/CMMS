<script lang="ts">
	import type { RecordModel } from 'pocketbase';

	import { type ColumnDef, type VisibilityState, getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
	import { createSvelteTable, renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
	import { DataTableSortColumn, SuperTable } from '$lib/components/costum';
	import { createRawSnippet, onMount } from 'svelte';
	import { createPageFile } from '$lib/PageTable.svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronLeft } from 'lucide-svelte';

	let { data } = $props();
	const { user } = data;

	const pageFile = createPageFile({
		collectionName: 'transaction_type',
		perPage: 10
	});

	export const columns: ColumnDef<RecordModel>[] = [
		{
			accessorKey: 'code',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Code',
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					disabled: pageFile.isLoading,
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
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => row.getValue('description')
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
	<title>CMMS - Transaction Type</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Config</span>
	</Button>
</div>

<SuperTable config={{ tableName: 'Transaction Type', disableAdd: true }} {table} {pageFile} {columns} />

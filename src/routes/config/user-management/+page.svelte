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

	const pageFile = createPageFile({ collectionName: 'users', perPage: 15 });

	export const columns: ColumnDef<(typeof pageFile)['items'][0]>[] = [
		{
			accessorKey: 'username',
			id: 'Employee Id',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Employee Id',
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					disabled: pageFile.isLoading,
					onclick: () => pageFile.sort('username')
				}),
			cell: ({ row }) => {
				const Snippet = createRawSnippet<[string]>(() => {
					const username = row.original.username;
					return {
						render: () => `<div class="capitalize">${username}</div>`
					};
				});
				return renderSnippet(Snippet);
			}
		},
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
			accessorKey: 'role',
			id: 'Role',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Role',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => row.original.role
		},
		{
			accessorKey: 'unit',
			id: 'Unit',
			header: ({ column }) =>
				renderComponent(DataTableSortColumn, {
					text: 'Unit',
					disabled: pageFile.isLoading,
					direction: pageFile.sortBucket === column.id ? pageFile.sortDirection : undefined,
					onclick: () => pageFile.sort(column.id)
				}),
			cell: ({ row }) => row.original.unit
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, { id: row.original.id, basePath: page.url.pathname, user: data.user, disableDelete: true });
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
		pageFile.setAuth(data.token, data.model);
		pageFile.load();
	});

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');
</script>

<svelte:head>
	<title>CMMS - User Management</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="size-4" />
		<span>Config</span>
	</Button>
</div>

<SuperTable config={{ tableName: 'User', disableAdd: false }} {table} {pageFile} {columns} />

<script lang="ts">
	import type { ColumnDef, Table as TableCore } from '@tanstack/table-core';
	import type { RecordModel } from 'pocketbase';
	import type { PageFile } from '$lib/PageTable.svelte';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Table from '$lib/components/ui/table/index.js';

	import { ChevronDown, LoaderCircle, PlusCircle } from 'lucide-svelte';
	import { DataTableFilterDropdown } from '.';
	import { FlexRender } from '../ui/data-table';
	import { Button } from '$lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';

	type Props = {
		pageFile: PageFile;
		table: TableCore<RecordModel>;
		columns: ColumnDef<RecordModel>[];
		config: {
			tableName?: string;
			disableAdd?: boolean;
			addUrl?: string;
		};
	};
	let {
		pageFile,
		table,
		columns,
		config = {
			tableName: 'Table',
			disableAdd: false,
			addUrl: undefined
		}
	}: Props = $props();
</script>

<div class="w-full">
	<div class="flex flex-col items-center gap-2 py-4 md:flex-row md:justify-between">
		<h1 class="relative flex flex-shrink-0 items-center justify-center text-2xl/8 font-semibold sm:text-xl/8">
			{config.tableName}
			{#if pageFile.isLoading}
				<span transition:fade={{ duration: 200 }} class="absolute -right-10 z-20 ml-4 items-center justify-center gap-3">
					<LoaderCircle class="animate-spin text-primary" />
				</span>
			{/if}
		</h1>
		<div class="grid grid-flow-col gap-2 md:ml-auto md:w-fit">
			<Button variant="outline">Export (CSV)</Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" class="ml-auto">
							Columns <ChevronDown class="ml-2 size-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					{#each table.getAllColumns().filter((col) => col.getCanHide()) as column}
						<DropdownMenu.CheckboxItem class="capitalize" bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}>
							{column.id}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<DataTableFilterDropdown {pageFile} {columns} />
			{#if !config.disableAdd}
				<Button class="overflow-hidden " href={config.addUrl ? config.addUrl : page.url.pathname + '/add'}>
					<span class="hidden md:block">Add</span> <PlusCircle class="h-4 w-4" /></Button>
			{/if}
		</div>
	</div>
	<div class="relative rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="[&:has([role=checkbox])]:pl-3">
								{#if !header.isPlaceholder}
									<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell class="[&:has([role=checkbox])]:pl-3">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 pt-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{pageFile.currentPage} of
			{pageFile.totalPages} page(s).
		</div>
		<div class="space-x-2">
			<Button variant="outline" size="sm" onclick={pageFile.prev} disabled={!pageFile.hasPrev || pageFile.isLoading}>Previous</Button>
			<Button variant="outline" size="sm" onclick={pageFile.next} disabled={!pageFile.hasNext || pageFile.isLoading}>Next</Button>
		</div>
	</div>
</div>

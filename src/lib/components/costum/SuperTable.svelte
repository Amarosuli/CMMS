<script lang="ts">
	import type { ColumnDef, Table as TableCore } from '@tanstack/table-core';
	import type { RecordModel } from 'pocketbase';
	import type { PageFile } from '$lib/PageTable.svelte';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Table from '$lib/components/ui/table/index.js';

	import { ChevronDown, LoaderCircle, PlusCircle } from 'lucide-svelte';
	import { FlexRender } from '../ui/data-table';
	import { Button } from '$lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import { DataTableFilterInput } from '$lib/components/costum';
	import { base } from '$app/paths';
	import { page } from '$app/state';

	let { tableName = 'Table', disableAdd = false, pageFile, table, columns }: { tableName?: string; disableAdd?: boolean; pageFile: PageFile; table: TableCore<RecordModel>; columns: ColumnDef<RecordModel>[] } = $props();
</script>

<div class="w-full">
	<div class="flex flex-col items-center gap-2 py-4 md:flex-row md:justify-between">
		<h1 class="relative flex flex-shrink-0 items-center justify-center text-2xl/8 font-semibold sm:text-xl/8">
			{tableName}
			{#if pageFile.isLoading}
				<span transition:fade={{ duration: 200 }} class="absolute -right-10 z-20 ml-4 items-center justify-center gap-3">
					<LoaderCircle class="animate-spin text-primary" />
				</span>
			{/if}
		</h1>
		<div class="grid grid-cols-2 items-center gap-2 sm:grid-flow-col">
			<Button variant="outline">Export (CSV)</Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline">
							Filter <ChevronDown class="ml-2 size-4" />
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
			{#if !disableAdd}
				<Button variant="ghost" class="overflow-hidden bg-primary hover:bg-primary/70" href="{page.url.pathname}/add">Add <PlusCircle class="h-4 w-4" /></Button>
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

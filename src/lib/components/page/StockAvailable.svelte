<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Table from '$lib/components/ui/table';
	import { addHiddenColumns, addSelectedRows, addSortBy, addTableFilter } from 'svelte-headless-table/plugins';
	import { ArrowDown, ArrowUp, ChevronDown, LoaderCircle, PlusCircle } from 'lucide-svelte';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import { DataTableActions } from '$lib/components/costum';
	import { createPageFile } from '$lib/helpers';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils.js';

	export let user;
	export let basePath: string;
	export let tableName: string;

	const { nextPage, prevPage, getState, setPerPage, addModifier } = createPageFile().init('stock_master', { expand: 'material_id,material_id.unit_id' });

	setPerPage(100);
	addModifier((items: any[]) => {
		return items.map((val) => {
			return { ...val, materialData: val.expand ? val.expand.material_id : 'N/A' };
		});
	});

	const { currentPage, items, totalPages, isLoading, hasPrevPage, hasNextPage } = getState();
	const table = createTable(items, {
		sort: addSortBy({ disableMultiSort: true }),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue)
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns()
	});

	const columns = table.createColumns([
		table.column({
			header: 'Batch Number',
			accessor: 'batch_number',
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.toLowerCase();
					}
				}
			}
		}),
		table.column({
			header: 'Quantity Available',
			accessor: (item) => item,
			cell: ({ value }) => {
				let materialUnit = value.materialData?.expand?.unit_id?.code || '';
				return value.quantity_available + ' ' + materialUnit;
			}
		}),
		table.column({
			header: 'Quantity Borrowed',
			accessor: (item) => item,
			cell: ({ value }) => {
				let materialUnit = value.materialData?.expand?.unit_id?.code || '';
				return value.quantity_borrowed + ' ' + materialUnit;
			}
		}),
		table.column({
			header: 'Code',
			accessor: (item) => item.materialData,
			cell: ({ value }) => {
				return value.code;
			}
		}),
		table.column({
			header: 'Description',
			accessor: (item) => item.materialData,
			cell: ({ value }) => {
				return value.description;
			}
		}),
		table.column({
			header: '',
			accessor: ({ id }) => id,
			cell: (item) => {
				return createRender(DataTableActions, { id: item.value, user, basePath });
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } = table.createViewModel(columns);
	const { selectedDataIds } = pluginStates.select;
	const { hiddenColumnIds } = pluginStates.hide;
	const { filterValue } = pluginStates.filter;
	const { sortKeys } = pluginStates.sort;

	const ids = flatColumns.map((c) => c.id);
	let hideForId = Object.fromEntries(ids.map((id) => [id, true]));

	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);

	const hideableCols = ['batch_number', 'Quantity Available', 'Quantity Borrowed', 'Code', 'Description'];
</script>

<div class="flex items-end justify-between gap-4">
	<h1 class="flex text-2xl/8 font-semibold sm:text-xl/8">
		{tableName}
		{#if $isLoading}
			<span transition:fade={{ duration: 200 }} class="ml-4 flex items-center justify-center gap-3">
				<LoaderCircle class="animate-spin text-primary" />
			</span>
		{/if}
	</h1>
	{#if user}
		<Button size="sm" href="/movement/stock-in">
			<div class="flex items-center gap-2">
				Add <PlusCircle class="h-4 w-4" />
			</div>
		</Button>
	{:else}
		<p class="block w-fit text-ellipsis text-right text-xs">Login to manage data</p>
	{/if}
</div>
<div class="flex items-center gap-2 py-2">
	<Input class="max-w-sm" placeholder="Filter name..." type="text" bind:value={$filterValue} />
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="outline" class="ml-auto" builders={[builder]}>
				Columns <ChevronDown class="ml-2 h-4 w-4" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each flatColumns as col}
				{#if hideableCols.includes(col.id)}
					<DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
						{col.header}
					</DropdownMenu.CheckboxItem>
				{/if}
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
<div class="flow-root rounded-md border">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
								<Table.Head {...attrs} class={cn('[&:has([role=checkbox])]:pl-3')}>
									{#if cell.id === 'id' || cell.id === ''}
										<Render of={cell.render()} />
									{:else}
										<Button variant="ghost" on:click={props.sort.toggle}>
											<Render of={cell.render()} />
											{#if $sortKeys[0]?.id === cell.id && $sortKeys[0]?.order === 'asc'}
												<ArrowDown class="ml-2 h-4 w-4 text-foreground" />
											{:else if $sortKeys[0]?.id === cell.id && $sortKeys[0]?.order === 'desc'}
												<ArrowUp class="ml-2 h-4 w-4 text-foreground" />
											{:else}
												<div class="ml-2 h-4 w-4"></div>
											{/if}
										</Button>
									{/if}
								</Table.Head>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
						{#each row.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell class="[&:has([role=checkbox])]:pl-3" {...attrs}>
									{#if cell.id === 'id' || cell.id === ''}
										<Render of={cell.render()} />
									{:else}
										<div class="ml-4 capitalize">
											<Render of={cell.render()} />
										</div>
									{/if}
								</Table.Cell>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Table from '$lib/components/ui/table';
	import { addHiddenColumns, addSelectedRows, addSortBy, addTableFilter } from 'svelte-headless-table/plugins';
	import { ArrowDown, ArrowUp, ChevronDown, LoaderCircle } from 'lucide-svelte';
	import { Render, Subscribe, createTable } from 'svelte-headless-table';
	import { createPageFile } from '$lib/helpers';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils.js';

	export let tableName: string;
	let searchInput = '';

	const { getState } = createPageFile().init('transaction_type');

	const { items, isLoading } = getState();
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
			header: 'Code',
			accessor: 'code',
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.toLowerCase();
					}
				}
			}
		}),
		table.column({
			header: 'Description',
			accessor: 'description'
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

	const hideableCols = ['code', 'description'];
	$: searchInput, ($filterValue = searchInput.toLowerCase());
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
</div>
<div class="flex items-center gap-2 py-2">
	<Input class="max-w-sm" placeholder="Filter..." type="text" bind:value={searchInput} />
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

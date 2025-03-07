<script lang="ts" generics="TData, TValue">
	import type { RecordModel } from 'pocketbase';
	import type { ColumnDef } from '@tanstack/table-core';
	import type { PageFile } from '$lib/PageTable.svelte';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	import { DataTableFilterOperator, DataTableFilterColumn } from '.';
	import { Check, Filter, Plus, Trash2, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { onMount } from 'svelte';
	import { Input } from '../ui/input';
	import { z } from 'zod';

	let { pageFile, columns }: { pageFile: PageFile; columns: ColumnDef<TData, TValue>[] } = $props();

	onMount(() => {
		// @ts-ignore
		for (let { accessorKey } of columns) {
			if (accessorKey) columnOption.push({ label: accessorKey, value: accessorKey });
		}
	});

	let columnOption: { label: string; value: string }[] = $state([]);

	const filterSchema = z
		.object({
			column: z.string().trim().min(1, 'Column is required'),
			operator: z.string().trim().min(1, 'Operator is required'),
			value: z.string().trim().min(1, 'Value is required')
		})
		.array();

	type FilterItem = z.infer<typeof filterSchema>;

	let list: FilterItem = $state([]);
	let activeFilter: number = $state(0);
	let open = $state(false);

	function check() {
		if (!activeFilter && !list.length) return;
		if (list.length) {
			return 'parse';
		} else {
			return 'reset';
		}
	}

	function parse() {
		activeFilter = 0;
		let groupMap = new Map();

		for (let { column, operator, value } of list) {
			if (filterSchema.safeParse([{ column, operator, value }]).success) {
				activeFilter++;
				if (!groupMap.has(column)) groupMap.set(column, []);
				groupMap.get(column).push(`${column}${operator}"${value}"`);
			}
		}

		let result = [...groupMap.values()].map((conditions) => conditions.join('||')).join('&&');
		return result;
	}

	function reset() {
		activeFilter = 0;
		list = [];
		pageFile.setFilter('');
		pageFile.reload();
		open = false;
	}

	function handleFilter() {
		if (check() == 'reset') return reset();

		let result = parse();

		if (!result) return;

		pageFile.setFilter(`(${result})`);
		pageFile.reload();
		open = false;
	}
</script>

<DropdownMenu.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) handleFilter();
	}}>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" class="relative">
				<span class="hidden md:block">Filter</span>
				<Filter class="size-4" />
				{#if activeFilter}
					<span class="rounded bg-secondary-foreground px-2 py-1 text-xs text-secondary">{activeFilter}</span>
				{/if}
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-screen md:w-full">
		{#if list.length === 0}
			<DropdownMenu.Label>
				<div class="flex flex-col gap-2 divide-y p-2">
					<div>No filters selected</div>
				</div>
			</DropdownMenu.Label>
		{:else}
			{#each list as item, index}
				<div class="flex flex-row gap-2 p-2">
					<DataTableFilterColumn {columnOption} bind:value={list[index].column} />
					<DataTableFilterOperator bind:value={list[index].operator} />
					<Input placeholder="anything..." bind:value={list[index].value} />
					<Button variant="outline" onclick={() => list.splice(index, 1)}><X class="size-4" /></Button>
				</div>
				<DropdownMenu.Separator></DropdownMenu.Separator>
			{/each}
		{/if}
		<div class="ml-auto flex w-full flex-row gap-2">
			<Button disabled={list.length == columnOption.length} class="flex w-full items-center justify-center" variant="outline" onclick={() => list.push({ column: '', operator: '', value: '' })}>
				<Plus class="size-4" /> Add a filter
			</Button>
			<Button disabled={!list.length} variant="outline" onclick={reset}>
				<Trash2 class="size-4" />
			</Button>
			<Button disabled={!list.length} variant="outline" onclick={handleFilter}>
				<Check class="size-4" />
			</Button>
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>

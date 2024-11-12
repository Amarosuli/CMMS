<script lang="ts">
	import { BorrowDataView, BorrowItemView, BorrowDataDelete, BorrowDataEdit, BorrowItemAdd } from '$lib/components/costum';
	import { ChevronLeft, CalendarPlus, Plus, Pencil, Trash, LoaderCircle } from 'lucide-svelte';
	import { writable } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers.js';

	export let data;

	let isDeleteDataOpen: boolean = false;
	let isEditDataOpen: boolean = false;
	let isAddItemOpen: boolean = false;
	let state = writable(false);

	function stateHandler(e: CustomEvent<{ value: boolean }>) {
		$state = e.detail.value;
	}

	$: stockIds = data.borrowItems.map((item) => {
		return { stock_id: item.stock_id };
	});
</script>

<svelte:head>
	<title>CMMS - Detail Borrowing</title>
</svelte:head>

<div>
	<Button href="/active-borrowing" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Active Borrowing</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Detail <span class="text-foreground/50">Borrowing</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{data.borrowData.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(data.borrowData.created)}</span></span>
		</div>
	</div>
</div>

<BorrowDataDelete bind:open={isDeleteDataOpen} borrowItems={data.borrowItems} borrowData={data.borrowData} />
<BorrowDataEdit bind:open={isEditDataOpen} borrowData={data.borrowData} />
<BorrowItemAdd bind:open={isAddItemOpen} borrowData={data.borrowData} {stockIds} on:state={(e) => stateHandler(e)} />

<div class="relative mt-12">
	<h2 class="flex-1 text-base/7 font-semibold text-foreground sm:text-sm/6">Borrowing Data</h2>
	<div class="absolute right-0 top-0 flex gap-2">
		<Button size="icon" on:click={() => (isEditDataOpen = !isEditDataOpen)} variant="outline">
			<Pencil class="h-4 w-4 text-lime-500" />
		</Button>
		<Button size="icon" on:click={() => (isDeleteDataOpen = !isDeleteDataOpen)} variant="outline">
			<Trash class="h-4 w-4 text-destructive" />
		</Button>
	</div>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<BorrowDataView borrowData={data.borrowData} />
</div>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Borrowing Items</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<div class="overflow-x-auto">
		{#each data.borrowItems as item}
			<BorrowItemView {item} bind:stockIds />
		{/each}
	</div>
	<Button variant="outline" disabled={$state} class="mt-4 flex w-fit gap-2 bg-lime-400 hover:bg-lime-300 dark:bg-lime-600 dark:hover:bg-lime-500" on:click={() => (isAddItemOpen = !isAddItemOpen)}>
		{#if $state}
			<LoaderCircle class="h-4 w-4 animate-spin" />
		{:else}
			<Plus class="h-4 w-4" />
		{/if}
		Add Item
	</Button>
</div>

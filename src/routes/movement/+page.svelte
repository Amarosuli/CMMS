<script lang="ts">
	import { CalendarPlus, ChevronLeft, LoaderCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import { time } from '$lib/helpers.js';
	import { getRecentMovements, type StockMovement } from './movement.remote.js';
	import { onMount } from 'svelte';

	let recentMovements: StockMovement[] = $state([]);
	onMount(async () => {
		recentMovements = (await getRecentMovements()) || [];
	});
	let isLoading = $state(false);
</script>

<svelte:head>
	<title>CMMS - Movement</title>
</svelte:head>

<div>
	<Button href="/" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Dashboard</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Recent <span class="text-foreground/50">Stock Movement</span></h1>
		{#if isLoading}
			<span transition:fade={{ duration: 200 }} class="ml-4 flex items-center justify-center gap-3">
				<LoaderCircle class="text-primary animate-spin" />
			</span>
		{/if}
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
	</div>
</div>

<div class="mt-12">
	<ul role="list" class="">
		{#each recentMovements as stock (stock.id)}
			<li class="hover:bg-secondary flex justify-between gap-x-6 border px-4 py-2">
				<div class="flex min-w-0 flex-col md:flex-row md:gap-4">
					<div class="flex w-20 min-w-20 flex-auto items-center divide-y">
						<p class=" text-foreground truncate text-lg font-bold">{stock.transactionType}</p>
					</div>
					<div class="min-w-0 flex-auto">
						<p class="text-foreground/50 mt-1 truncate text-xs leading-5">Batch Number : <span class="text-foreground text-xs leading-6 font-semibold">{stock.batchNumber}</span></p>
						<p class="text-foreground/50 mt-1 truncate text-xs leading-5">Purchase Order : <span class="text-foreground text-xs leading-6 font-semibold">{stock?.purchaseOrder}</span></p>
					</div>
					<div class="min-w-0 flex-auto">
						<p class="text-foreground/50 mt-1 truncate text-xs leading-5">Quantity : <span class="text-foreground text-xs leading-6 font-semibold">{stock.quantity} EA</span></p>
						<p class="text-foreground/50 mt-1 truncate text-xs leading-5">Remark : <span class="text-foreground text-xs leading-6 font-semibold">{stock.remark || '-'}</span></p>
					</div>
				</div>
				<div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
					<p class="text-foreground text-xs leading-6 font-semibold">{stock.user}</p>
					<p class="text-foreground/50 mt-1 text-xs leading-5 italic">{time(stock.created)}</p>
				</div>
			</li>{/each}
		{#if recentMovements.length === 0}
			<p class="text-foreground/50 text-center text-sm/6 italic">No recent stock movement</p>
		{/if}
	</ul>
</div>

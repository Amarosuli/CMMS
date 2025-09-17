<script lang="ts">
	import { CalendarPlus, ChevronLeft, LoaderCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import { time } from '$lib/helpers.js';
	import { getRecentMovements, type StockMovement } from './movement.remote.js';
	import { onMount } from 'svelte';

	let recentMovements: StockMovement[] = $state([]);
	let isLoading = $state(false);

	onMount(async () => {
		isLoading = true;
		recentMovements = (await getRecentMovements()) || [];
		isLoading = false;
	});
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
		<ol class="border-primary/50 relative border-s">
			{#each recentMovements as stock (stock.id)}
				<li class="ms-4 mb-7" in:fade>
					<div class="border-primary bg-primary absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border"></div>
					<time class="mb-1 text-sm leading-none font-normal">{time(stock.created)}</time>
					<h3 class="text-md font-bold">{stock.transactionType === 'SIN' ? 'Stock In' : ' Stock Out'}</h3>
					<div class="flex w-[300px] flex-col text-xs font-normal text-gray-700 dark:text-gray-400">
						<p class="flex justify-between border-b pt-1">Batch Number <span class="text-primary dark:text-foreground font-semibold transition-colors ease-out">{stock.batchNumber}</span></p>
						<p class="flex justify-between border-b pt-1">Purchase Order <span class="text-primary dark:text-foreground font-semibold transition-colors ease-out">{stock.purchaseOrder}</span></p>
						<p class="flex justify-between border-b pt-1">Quantity <span class="text-primary dark:text-foreground font-semibold transition-colors ease-out">{stock.quantity}</span></p>
						<p class="flex justify-between border-b pt-1">Remark <span class="text-primary dark:text-foreground max-w-[200px] font-semibold capitalize transition-colors ease-out">{stock.remark.toLowerCase() || ''}</span></p>
					</div>
				</li>
			{/each}
		</ol>

		{#if isLoading}
			<p class="text-foreground/50 text-center text-sm/6 italic">Loading History ...</p>
		{:else if recentMovements.length === 0}
			<p class="text-foreground/50 text-center text-sm/6 italic">No recent stock movement</p>
		{/if}
	</ul>
</div>

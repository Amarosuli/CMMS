<script lang="ts">
	import { CalendarPlus, ChevronLeft, LoaderCircle } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import { time } from '$lib/helpers.js';

	export let data;
	const { allStockIn, allStockOut } = data;

	$: isLoading = false;

	const processData = () => {
		isLoading = true;
		const stockOut = allStockOut.map((stock) => {
			return { id: stock.id, quantity: stock.quantity, transactionType: stock.transaction_type, remark: stock.remark, purchaseOrder: stock.expand?.stock_id.purchase_order, batchNumber: stock.expand?.stock_id.batch_number, user: stock.expand?.user_id.name, created: stock.created };
		});
		const stockIn = allStockIn.map((stock) => {
			return { id: stock.id, quantity: stock.quantity, transactionType: stock.transaction_type, remark: stock.remark, purchaseOrder: stock.purchase_order, batchNumber: stock.batch_number, user: stock.expand?.user_id.name, created: stock.created };
		});
		isLoading = false;
		return stockIn.concat(stockOut);
	};
	let stockMovement = processData();
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
				<LoaderCircle class="animate-spin text-primary" />
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
		{#each stockMovement as stock (stock.id)}
			<li class="flex justify-between gap-x-6 border px-4 py-2 hover:bg-secondary">
				<div class="flex min-w-0 flex-col md:flex-row md:gap-4">
					<div class="flex w-20 min-w-20 flex-auto items-center divide-y">
						<p class=" truncate text-xl font-bold text-foreground">{stock.transactionType}</p>
					</div>
					<div class="min-w-0 flex-auto">
						<p class="mt-1 truncate text-xs leading-5 text-foreground/50">Batch Number : <span class="text-xs font-semibold leading-6 text-foreground">{stock.batchNumber}</span></p>
						<p class="mt-1 truncate text-xs leading-5 text-foreground/50">Purchase Order : <span class="text-xs font-semibold leading-6 text-foreground">{stock.purchaseOrder}</span></p>
					</div>
					<div class="min-w-0 flex-auto">
						<p class="mt-1 truncate text-xs leading-5 text-foreground/50">Quantity : <span class="text-xs font-semibold leading-6 text-foreground">{stock.quantity} EA</span></p>
						<p class="mt-1 truncate text-xs leading-5 text-foreground/50">Remark : <span class="text-xs font-semibold leading-6 text-foreground">{stock.remark || '-'}</span></p>
					</div>
				</div>
				<div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
					<p class="text-xs font-semibold leading-6 text-foreground">{stock.user}</p>
					<p class="mt-1 text-xs italic leading-5 text-foreground/50">{time(stock.created)}</p>
				</div>
			</li>{/each}
	</ul>
</div>

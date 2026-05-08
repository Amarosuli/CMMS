<script lang="ts">
	import { ChevronLeft, CalendarPlus, Pencil, Trash2, Barcode } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';

	import type { StockMaster } from '$lib/CostumTypes';
	import AddToLabelCart from '$lib/components/costum/AddToLabelCart.svelte';

	let { data } = $props();
	// let isLoading = $state(false);

	const { allStock } = $derived(data);

	function getQtyAvailableInStore(stock: StockMaster) {
		return stock.quantity_available ? `${stock.quantity_available - stock.quantity_borrowed} ${stock.expand?.material_master_id.expand.material_unit_id.code}` : '';
	}
</script>

<svelte:head>
	<title>CMMS - Detail Stock Master</title>
</svelte:head>

<div>
	<Button href="/stock" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Stock Master</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Detail <span class="text-foreground/50">Stock Master</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-hover:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-hover:bg-lime-400/15 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<!-- <span>{time(data.stockMaster?.created)}</span> -->
			</span>
		</div>
		<div class="flex gap-4"></div>
	</div>
</div>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Detail of Stock</h2>
	{#if allStock.items.length}
		{#each allStock.items as stock (stock.id)}
			<div class="mt-4 overflow-x-auto pb-2">
				<div class="flex min-w-max items-center justify-end gap-2">
					<Button variant="outline" size="sm" class="w-fit shrink-0 rounded-md bg-lime-400/20 px-3 py-0.5 text-center text-sm/5 font-medium text-lime-700  sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 forced-colors:outline">{stock.batch_number}</Button>
					<AddToLabelCart data={stock} />
					<Button variant="outline" size="sm" class="shrink-0 text-xs"><Barcode class="size-4" />Print Label</Button>
					<Button variant="outline" size="sm" class="shrink-0 text-xs"><Pencil class="size-4" /> Edit</Button>
					<Button variant="outline" size="sm" class="shrink-0 text-xs"><Trash2 class="size-4" /> Delete</Button>
				</div>
			</div>
			<hr role="presentation" class="w-full border-t border-foreground/10" />
			<dl class="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,--spacing(80))_auto] sm:text-sm/6">
				<dt class="col-start-1 border-t border-foreground/5 pt-2 text-foreground/50 first:border-none sm:py-2">Batch Number</dt>
				<dd class=" pb-2 text-foreground sm:border-t sm:border-foreground/5 sm:py-2 sm:nth-2:border-none">{stock.batch_number}</dd>
				<dt class="col-start-1 border-t border-foreground/5 pt-2 text-foreground/50 first:border-none sm:py-2">Purchase Order</dt>
				<dd class=" pb-2 text-foreground sm:border-t sm:border-foreground/5 sm:py-2 sm:nth-2:border-none">{stock.purchase_order}</dd>
				<dt class="col-start-1 border-t border-foreground/5 pt-2 text-foreground/50 first:border-none sm:py-2">Available Quantity</dt>
				<dd class=" pb-2 text-foreground sm:border-t sm:border-foreground/5 sm:py-2 sm:nth-2:border-none">{stock.quantity} {stock.expand?.material_master_id.expand.material_unit_id.code || '-'} ( Available in store {getQtyAvailableInStore(stock)} )</dd>
				<dt class="col-start-1 border-t border-foreground/5 pt-2 text-foreground/50 first:border-none sm:py-2">Borrowed Quantity</dt>
				<dd class=" pb-2 text-foreground sm:border-t sm:border-foreground/5 sm:py-2 sm:nth-2:border-none">{stock.quantity_borrowed} {stock.expand?.material_master_id.expand.material_unit_id.code || '-'}</dd>
				<dt class="col-start-1 border-t border-foreground/5 pt-2 text-foreground/50 first:border-none sm:py-2">Expired Date</dt>
				<dd class=" pb-2 text-foreground sm:border-t sm:border-foreground/5 sm:py-2 sm:nth-2:border-none">{stock.expired_date}</dd>
				<dt class="col-start-1 border-t border-foreground/5 pt-2 text-foreground/50 first:border-none sm:py-2">Material Code</dt>
				<dd class=" pb-2 text-foreground sm:border-t sm:border-foreground/5 sm:py-2 sm:nth-2:border-none">{stock.expand?.material_master_id.expand.material_unit_id.code || '-'}</dd>
				<dt class="col-start-1 border-t border-foreground/5 pt-2 text-foreground/50 first:border-none sm:py-2">Material Part Number</dt>
				<dd class=" pb-2 text-foreground sm:border-t sm:border-foreground/5 sm:py-2 sm:nth-2:border-none">{stock.expand?.material_master_id.part_number || '-'}</dd>
				<dt class="col-start-1 border-t border-foreground/5 pt-2 text-foreground/50 first:border-none sm:py-2">Material Description</dt>
				<dd class=" pb-2 text-foreground sm:border-t sm:border-foreground/5 sm:py-2 sm:nth-2:border-none">{stock.expand?.material_master_id.description || '-'}</dd>
			</dl>
		{/each}
	{/if}
</div>

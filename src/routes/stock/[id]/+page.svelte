<script lang="ts">
	import { ChevronLeft, CalendarPlus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let material = data.stockMaster?.expand?.material_id ? { ...data.stockMaster.expand.material_id } : { code: '-', part_number: '-', description: '-' };
	let unit = data.stockMaster?.expand?.material_id?.expand?.unit_id ? { code: data.stockMaster.expand.material_id.expand.unit_id.code } : { code: '' };
	let qtyAvailableInStore = data.stockMaster?.quantity_borrowed && data.stockMaster?.quantity_available ? `: ${data.stockMaster.quantity_available - data.stockMaster.quantity_borrowed} ${unit.code}` : '';
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
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(data.stockMaster?.created)}</span></span>
		</div>
		<div class="flex gap-4">
			<Button variant="outline" onclick={() => goto(page.url.pathname + '/edit')} class="min-w-20 ">Edit</Button>
		</div>
	</div>
</div>

<!-- @TODO : add image and also barcode, maybe barcode just have to render from detail page only. -->
<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Detail of Stock Master</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<dl class="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6">
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Batch Number</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.stockMaster?.batch_number}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Purchase Order</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.stockMaster?.purchase_order}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Available Quantity</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.stockMaster?.quantity_available} {unit?.code} ( Available in store{qtyAvailableInStore} )</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Borrowed Quantity</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.stockMaster?.quantity_borrowed} {unit.code}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Expired Date</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.stockMaster?.expired_date}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Material Code</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{material.code}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Material Part Number</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{material.part_number}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Material Description</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{material.description}</dd>
	</dl>
</div>

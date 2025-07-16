<script lang="ts">
	import { ChevronLeft, CalendarPlus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');

	let material = data.stockMaster?.expand?.material_id ? { ...data.stockMaster.expand.material_id } : { code: '-', part_number: '-', description: '-' };
	let unit = data.stockMaster?.expand?.material_id?.expand?.unit_id ? { code: data.stockMaster.expand.material_id.expand.unit_id.code } : { code: '' };
	let qtyAvailableInStore = data.stockMaster?.quantity_borrowed && data.stockMaster?.quantity_available ? `: ${data.stockMaster.quantity_available - data.stockMaster.quantity_borrowed} ${unit.code}` : '';
</script>

<svelte:head>
	<title>CMMS - Edit Stock Master</title>
</svelte:head>

<div>
	<Button href="/stock" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Stock Master</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Edit <span class="text-foreground/50">Stock Master</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(data.stockMaster?.created)}</span></span>
		</div>
		<div class="flex gap-4">
			<Button variant="outline" onclick={() => goto(backUrl)} class="min-w-20 ">Detail</Button>
		</div>
	</div>
</div>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Edit of Stock Master</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<p>This feature under review according to security. Add stock should be covered by stock-in, and stock-out will responsible for alteration quantity.</p>
	<!-- @TODO : Edit should be possible according to the affected table is stock_in -->
	<!-- @ATTENTION : Maybe it was mistake by the table design, stock_in and stock_out should record the transaction only, but there's must be another table to hold and balance the data as representative of stock table. -->
</div>

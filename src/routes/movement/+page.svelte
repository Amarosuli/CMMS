<script lang="ts">
	import { CalendarPlus, ChevronLeft, LoaderCircle } from '@lucide/svelte';
	import { getRecentStockIn, getRecentStockOut } from './movement.remote.js';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import { time } from '$lib/helpers.js';

	type MovementData = {
		id: string;
		partNumber: string;
		description: string;
		batchNumber: string;
		purchaseOrder?: string;
		quantity: number;
		remark?: string;
		created: string;
	};

	let now = today(getLocalTimeZone());

	const lastDayTime = '23:59:59.999Z';
	const firstDayTime = '00:00:00.000Z';

	let filter = `created >= "${now.subtract({ days: 1 })} ${firstDayTime}" && created <= "${now} ${lastDayTime}"`;
	let isLoading = $state(false);
	let movementData = $state<MovementData[]>();

	onMount(async () => {
		isLoading = true;
		movementData = await getRecentStockOut();
		isLoading = false;
	});

	let movementType = $state<'OUT' | 'IN'>('OUT');
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

<div class="mt-4 border-b pb-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Recent <span class="text-foreground/50 capitalize">Stock {movementType.toLowerCase()} Movement</span></h1>
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

<div class="mt-4 flex gap-4">
	<Button
		variant="outline"
		class={movementType === 'OUT' ? 'bg-primary hover:bg-primary dark:bg-primary/50 dark:hover:bg-primary/70' : ''}
		onclick={() => {
			isLoading = true;
			movementType = 'OUT';
			getRecentStockOut()
				.then((res) => {
					movementData = res;
				})
				.catch((er) => {
					toast.error(er);
				})
				.finally(() => {
					isLoading = false;
				});
		}}>Stock Out</Button>
	<Button
		variant="outline"
		class={movementType === 'IN' ? 'bg-primary hover:bg-primary dark:bg-primary/50 dark:hover:bg-primary/70' : ''}
		onclick={() => {
			isLoading = true;
			movementType = 'IN';
			getRecentStockIn()
				.then((res) => {
					movementData = res;
				})
				.catch((er) => {
					toast.error(er);
				})
				.finally(() => {
					isLoading = false;
				});
		}}>Stock In</Button>
</div>

<div class="mt-12">
	<ul role="list" class="">
		<ol class="relative border-s border-primary/50">
			{#each movementData as stock (stock.id)}
				<li class="ms-4 mb-7" in:fade>
					<div class="absolute -inset-s-1.5 mt-1.5 h-3 w-3 rounded-full border border-primary bg-primary"></div>
					<time class="mb-1 text-sm leading-none font-normal">{time(stock.created)}</time>
					<h3 class="text-md font-bold capitalize">Stock {movementType.toLowerCase()}</h3>
					<div class="flex w-75 flex-col text-xs font-normal text-gray-700 dark:text-gray-400">
						<p class="flex justify-between border-b pt-1">Part Number <span class="font-semibold text-primary transition-colors ease-out dark:text-foreground">{stock.partNumber}</span></p>
						<p class="flex justify-between border-b pt-1">Description <span class="font-semibold break-normal text-primary transition-colors ease-out dark:text-foreground">{stock.description}</span></p>
						<p class="flex justify-between border-b pt-1">Batch Number <span class="font-semibold text-primary transition-colors ease-out dark:text-foreground">{stock.batchNumber}</span></p>
						<p class="flex justify-between border-b pt-1">Purchase Order <span class="font-semibold text-primary transition-colors ease-out dark:text-foreground">{stock.purchaseOrder}</span></p>
						<p class="flex justify-between border-b pt-1">Quantity <span class="font-semibold text-primary transition-colors ease-out dark:text-foreground">{stock.quantity}</span></p>
						<p class="flex justify-between border-b pt-1">Remark <span class="max-w-50 font-semibold text-primary capitalize transition-colors ease-out dark:text-foreground">{stock.remark?.toLowerCase() || ''}</span></p>
					</div>
				</li>
			{/each}
		</ol>

		{#if isLoading}
			<p class="text-center text-sm/6 text-foreground/50 italic">Loading History ...</p>
		{:else if movementData?.length === 0}
			<p class="text-center text-sm/6 text-foreground/50 italic">No stock movement today</p>
		{/if}
	</ul>
</div>

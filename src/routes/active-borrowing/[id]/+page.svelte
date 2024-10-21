<script lang="ts">
	import { BorrowDataView, BorrowItemView, BorrowDataDelete } from '$lib/components/costum';
	import { ChevronLeft, CalendarPlus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers.js';
	import { pb } from '$lib/pocketbaseClient';

	export let data;

	function editBorrowData() {
		pb.collection('borrow_movement').update(data.borrowData.id, {});
	}

	let isDeleteDataOpen: boolean = false;
</script>

<svelte:head>
	<title>CMMS - Edit Borrowing</title>
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
<div class="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
	<div class="relative">
		<div class="mt-6 flex flex-col gap-3">
			<div class="flex justify-between">
				<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Borrowing Data</h2>
				<Button on:click={editBorrowData} variant="outline">Edit</Button>
				<Button on:click={() => (isDeleteDataOpen = !isDeleteDataOpen)} variant="outline">Delete</Button>
			</div>
			<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
			<BorrowDataView borrowData={data.borrowData} />
		</div>
		<div class="mt-6 flex flex-col gap-3">
			<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Borrowing Items</h2>
			<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
			{#each data.borrowItems as item}
				<BorrowItemView {item} />
			{/each}
		</div>
	</div>
</div>

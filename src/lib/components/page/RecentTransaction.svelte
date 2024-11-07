<script lang="ts">
	import type { BorrowMovement } from '$lib/CostumTypes';
	import { time } from '$lib/helpers';
	import { pb } from '$lib/pocketbaseClient';
	import { LoaderCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let isLoading = false;
	let recentItems: BorrowMovement[] = [];
	onMount(async () => {
		isLoading = true;
		recentItems = await pb.collection('borrow_movement').getFullList({ expand: 'user_id', sort: '-updated', batch: 10 });
		isLoading = false;
	});
</script>

<div>
	{#if recentItems.length === 0}
		{#if isLoading}
			<LoaderCircle class="h-4 w-4 animate-spin" />
		{:else}
			<p class="inline-flex w-fit items-center rounded-md bg-lime-400/20 p-2 text-sm/5 font-bold text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">Currently no recent transaction</p>
		{/if}
	{:else}
		{#each recentItems as item}
			<div class="grid items-center border-x border-b p-2 text-xs first:border-t sm:grid-cols-2 sm:gap-0 md:text-sm xl:grid-cols-4 xl:gap-4">
				<p>{time(item.updated, { format: 'dddd, DD MMM YYYY - h:mm A' })}</p>
				<div class="flex gap-2 md:flex-col">
					<p>ESN {item.esn || '-'}</p>
					<p class="md:hidden">/</p>
					<p>Order Number {item.order_number || '-'}</p>
				</div>
				<div class="flex gap-2 md:flex-col">
					<p class="text-xs">{item.expand?.user_id.username}</p>
					<p class="md:hidden">/</p>
					<p class="text-xs">{item.expand?.user_id.name}</p>
				</div>
				<div>
					<p class="hidden text-xs md:block">Status</p>
					<p class="text-xs">{item.status}</p>
				</div>
			</div>
		{/each}
	{/if}
</div>

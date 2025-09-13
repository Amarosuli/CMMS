<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers';
	import { CalendarPlus, ChevronLeft, CircleUserRound, LoaderCircle } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { getActiveBorrowing } from './list-transaction.remote';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	function stopPropagation(fn) {
		return function (event) {
			event.stopPropagation();
			fn.call(this, event);
		};
	}
	let isLoading = $state(false);
</script>

<svelte:head>
	<title>CMMS - List Transaction</title>
</svelte:head>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">List <span class="text-foreground/50">Transaction</span></h1>
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

<!-- <SuperTable config={} /> -->
<div class="w-h-full mt-3 grid grid-cols-4 gap-3">
	{#await getActiveBorrowing()}
		<span transition:fade={{ duration: 200 }} class="ml-4 flex items-center justify-center gap-3">
			<LoaderCircle class="text-primary animate-spin" /> Loading ...
		</span>
	{:then { status, data }}
		{#if status === 'success'}
			{#each data!.items as item}
				<Button onclick={() => goto(`/return/${item.id}?fromUrl=/dashboard/list-transaction`)} variant="ghost" class="relative flex h-full w-full cursor-pointer items-center gap-4 rounded-2xl border px-5 py-3 shadow-md transition-colors ease-in-out select-none ">
					<Button variant="ghost" onclick={stopPropagation(() => goto(`/active-borrowing/${item.id}?fromUrl=/dashboard/list-transaction`))} class="absolute top-1 left-1 z-20 rounded-2xl bg-amber-200">Edit</Button>
					<CircleUserRound class="mt-5 size-12" />
					<div class="flex flex-col text-sm">
						<p>{item.expand?.user_id.username} - {item.expand?.user_id.name}</p>
						<p class="flex justify-between text-xs">ESN <span>{item.esn || '-'}</span></p>
						<p class="flex justify-between text-xs">Order <span>{item.order_number || '-'}</span></p>
						<p class="flex justify-between pb-2 text-xs">Status <span>{item.status}</span></p>
					</div>
				</Button>
			{/each}
		{:else}
			<p>Error occured</p>
		{/if}
	{/await}
</div>

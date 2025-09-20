<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers';
	import { BanknoteArrowUp, CalendarPlus, ChevronLeft, CircleUserRound, LoaderCircle, Pencil } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { getActiveBorrowing } from './list-transaction.remote';

	import { goto } from '$app/navigation';

	// function stopPropagation(fn: Function) {
	// 	return function (event: Event) {
	// 		event.stopPropagation();
	// 		fn.call(this, event);
	// 	};
	// }
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
<div class="mt-3 grid h-full w-full gap-2 lg:grid-cols-3">
	{#await getActiveBorrowing()}
		<span transition:fade={{ duration: 200 }} class="absolute z-10 ml-4 flex items-center justify-center gap-3">
			<LoaderCircle class="text-primary animate-spin" /> Loading ...
		</span>
	{:then { status, data }}
		{#if status === 'success'}
			{#each data! as item, index}
				<div in:fade={{ delay: 5000 * index }} class="flex h-full w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-slate-200 transition-colors ease-in-out select-none dark:bg-slate-900">
					<div class="flex h-full w-full items-center justify-center bg-slate-400 dark:bg-slate-800">
						<CircleUserRound class="text-foreground/50 size-24" />
					</div>
					<div class="flex w-2/3 flex-col items-center justify-end py-2 pr-3">
						<div class="flex w-full flex-col justify-between text-sm">
							<p class="truncate font-semibold">{item.expand?.user_id.username} - {item.expand?.user_id.name}</p>
							<p class="flex justify-between border-b pt-1 text-xs">ESN <span>{item.esn || '-'}</span></p>
							<p class="flex justify-between border-b pt-1 text-xs">Order <span>{item.order_number || '-'}</span></p>
							<p class="flex justify-between border-b pt-1 text-xs">Status <span>{item.status}</span></p>
						</div>
						<div class="mt-2 flex w-full items-center justify-end gap-3 self-end">
							<Button variant="outline" class="cursor-pointer " onclick={() => goto(`/active-borrowing/${item.id}?fromUrl=/dashboard/list-transaction`)}><Pencil class="size-4 text-amber-300" /> Edit</Button>
							<Button variant="outline" class="cursor-pointer" onclick={() => goto(`/return/${item.id}?fromUrl=/dashboard/list-transaction`)}><BanknoteArrowUp class="text-primary size-4" /> Return</Button>
						</div>
					</div>
				</div>
			{/each}
		{:else}
			<p>Error occured</p>
		{/if}
	{/await}
</div>

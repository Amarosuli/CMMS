<script lang="ts">
	import { CalendarPlus, LoaderCircle } from '@lucide/svelte';
	import { getTotalBorrowedToday } from './dashboard.remote';
	import { clock } from '$lib/clock.svelte';
	import { fade } from 'svelte/transition';

	let isLoading = $state(false);

	const totalClosedBorrowings = $derived(await getTotalBorrowedToday());
	const totalOpenBorrowings = $derived(await getTotalBorrowedToday('OPEN'));
</script>

<svelte:head>
	<title>CMMS - Dashboard Transaction</title>
</svelte:head>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Borrowing <span class="text-foreground/50">Dashboard</span></h1>
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
				<span>{clock.realtime}</span>
			</span>
		</div>
	</div>
</div>
<div class="mt-4 lg:mt-8">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Summary</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<dl class="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,--spacing(80))_auto] sm:text-sm/6">
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Total Borrowings (Today)</dt>
		<dd class="pt-1 pb-3 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:nth-2:border-none">{totalOpenBorrowings}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Total Open Borrowings (Today)</dt>
		<dd class="pt-1 pb-3 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:nth-2:border-none">{totalOpenBorrowings}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Total Closed Borrowings (Today)</dt>
		<dd class="pt-1 pb-3 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:nth-2:border-none">{totalClosedBorrowings}</dd>
	</dl>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { ConfirmDialog } from '$lib/components/costum';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers';
	import { CalendarPlus, ChevronLeft, Eye, LoaderCircle, Pencil, SquareUser } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { getOpenBorrowings } from './dashboard.remote';
	import type { BorrowStatus, User } from '$lib/CostumTypes';
	import { onMount } from 'svelte';

	let isLoading = $state(false);
	let confirmDialog: boolean[] = $state([]);
</script>

<svelte:head>
	<title>CMMS - Dashboard Transaction</title>
</svelte:head>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Borrowing <span class="text-foreground/50">Dashboard</span></h1>
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

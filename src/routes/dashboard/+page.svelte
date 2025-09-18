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

	// interface openBorrowingType {
	// 	user: User;
	// 	isCheckOut: boolean;
	// 	user_id: string;
	// 	order_number: string;
	// 	esn: string;
	// 	status: BorrowStatus;
	// 	expand: { user_id: User };
	// 	collectionId: string;
	// 	collectionName: string;
	// 	id: string;
	// 	created: string;
	// 	updated: string;
	// }

	// let openBorrowing: openBorrowingType[] = $state([]);
	// onMount(async () => {
	// 	isLoading = true;
	// 	openBorrowing = await getOpenBorrowings();
	// 	isLoading = false;
	// });
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

<!-- <div class="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
	{#if openBorrowing.length === 0}
		<p class="inline-flex w-fit items-center rounded-md bg-lime-400/20 p-2 text-sm/5 font-bold text-lime-700 group-data-[hover]:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 forced-colors:outline">Currently no active borrowing</p>
	{/if}
	{#key confirmDialog}
		{#each openBorrowing as borrow, index}

			<div class="relative">
				<hr role="presentation" class="w-full border-t" />
				<div class="mt-6 font-mono text-sm/3 font-light text-lime-500 sm:text-xs/3">{time(borrow.created, { format: 'ddd, DD MMM YYYY - h:mm A' })}</div>
				<div class=" flex items-center text-lg font-medium sm:text-sm/6"><SquareUser class="mr-2 h-4 w-4" /> {borrow.user.username} - {borrow.user.name}</div>
				<div class="text-foreground/80 mt-3 text-2xl/8 font-extrabold sm:text-xl/8" class:text-lime-500={borrow.status === 'OPEN'} class:text-yellow-500={borrow.status === 'PENDING'}>{borrow.status}</div>
				<div class="mt-3 text-sm/6 sm:text-xs/6">
					<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 forced-colors:outline">{borrow.esn || 'No ESN'}</span> <span class="text-zinc-500">{borrow.order_number || 'No Order Number'}</span>
				</div>
				<div class="mt-3 flex flex-col gap-2">
					<div class="flex gap-2">
						<Button variant="outline" class="flex-1" onclick={() => goto('/active-borrowing/' + borrow.id)}>
							<Pencil class="mr-2 h-4 w-4" />
							Edit
						</Button>
					</div>
					<Button variant="outline" disabled={!(borrow.status === 'PENDING') || borrow.isCheckOut} onclick={() => (confirmDialog[index] = !confirmDialog[index])}>
						{#if borrow.isCheckOut}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
							Closing Transaction
						{:else}
							Close Transaction
						{/if}
					</Button>
				</div>
			</div>
		{/each}
	{/key}
</div> -->

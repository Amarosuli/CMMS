<script lang="ts">
	import { BookmarkCheck, BookmarkX, CalendarPlus, LoaderCircle, Save, ScanBarcode } from '@lucide/svelte';
	import { getUserByUsername, getStockItemByLabel, getStockItemById, borrowStart } from '$lib/remote-function/borrow.remote';
	import { BorrowMovementStatus, StockItemStatus, type User } from '$lib/CostumTypes';
	import { BorrowItemViewTemporary } from '$lib/components/costum';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { clock } from '$lib/clock.svelte';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';

	let borrowingData = $state({
		movement: {
			user_id: '',
			order_number: '',
			esn: '',
			status: BorrowMovementStatus.OPEN
		},
		items: [] as { label: string; stock_item_id: string; quantity_out: number }[]
	});

	let isLoading = $state(false);
	let delayedItem = $state(false);
	let employeeId = $state('');
	let userData: User | null = $state(null);
	let getUserLoading = $state(false);
	let isTyping = $state(false);

	async function doneTyping() {
		isTyping = false;
		getUserLoading = true;
		const { message, data } = await getUserByUsername(employeeId);
		toast.info(message);
		userData = data;
		getUserLoading = false;
	}

	let stockLabel = $state('');
	let isQuering = $state(false);

	$effect(() => {
		if (userData) {
			borrowingData.movement.user_id = userData.id;
		} else {
			borrowingData.movement.user_id = '';
		}
	});

	async function addToTray(stockLabel: string) {
		try {
			isQuering = true;

			let result = await getStockItemByLabel(stockLabel); // check availability in system

			if (!result.data) {
				toast.info('Item not found');
				isQuering = false;
				return;
			}

			if (result.data.status === StockItemStatus.DISPOSED) {
				toast.info('Disposed item should not be able to borrow');
				isQuering = false;
				return;
			}

			if (result.data.isBorrowed) {
				toast.info('Item already borrowed by other user');
				isQuering = false;
				return;
			}

			const existingItem = borrowingData.items.find((stock) => stock.label === result.data.label);

			if (existingItem) {
				toast.info('Item already in tray');
				isQuering = false;
				return;
			} else {
				toast.success('Item added');
				borrowingData.items.push({ label: result.data.label, stock_item_id: result.data.id, quantity_out: result.data.size });
			}
		} catch (error) {
			console.error(error);
			toast.error('An unexpected error occurred');
		} finally {
			isQuering = false;
		}
	}

	async function save() {
		if (borrowingData.movement.user_id === '') {
			toast.error('Employee ID is required');
			return;
		}

		delayedItem = true;
		await borrowStart({
			movement: borrowingData.movement,
			items: borrowingData.items
		})
			.then((result) => {
				toast.info(`${result.message}, ${result.data}`);
			})
			.catch((err) => {
				console.error(err);
				toast.error('An unexpected error occured');
			})
			.finally(() => {
				delayedItem = false;
				goto('list-transaction');
			});
	}
</script>

<svelte:head>
	<title>CMMS - New Transaction</title>
</svelte:head>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">New <span class="text-foreground/50">Transaction</span></h1>
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
				<span>{clock.realtime}</span></span>
		</div>
	</div>
</div>

<div class="mt-4 space-y-3">
	<div class="flex items-center gap-4">
		<div class="flex w-full max-w-sm flex-col gap-1.5">
			<Label for="user_id">Employee ID</Label>
			<Input id="user_id" name="user_id" bind:value={employeeId} type="text" placeholder="Employee ID" onfocus={() => (isTyping = true)} onblur={doneTyping} />
		</div>
		{#if getUserLoading}
			<div class="mt-4">
				<p class="text-sm/4 text-foreground/50">Get employee detail...</p>
			</div>
		{:else}
			<div class="mt-4">
				{#if userData}
					<div class="flex items-center gap-3">
						<BookmarkCheck class="size-6 text-lime-400" />
						<div>
							<p class="text-sm/4 text-foreground/80">Name: {userData?.name}</p>
							<p class="text-sm/4 text-foreground/80">Unit: {userData?.unit}</p>
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-3">
						<BookmarkX class="size-6 text-destructive" />
						<p class="text-sm/4 text-foreground/80">{isTyping ? '' : 'No Employee Data Found'}</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
	<div class="flex w-full max-w-sm flex-col gap-1.5">
		<Label for="order_number">Order Number</Label>
		<Input id="order_number" name="order_number" bind:value={borrowingData.movement.order_number} type="text" placeholder="Order Number" />
	</div>
	<div class="flex w-full max-w-sm flex-col gap-1.5">
		<Label for="esn">ESN or A/C Register</Label>
		<Input id="esn" name="esn" bind:value={borrowingData.movement.esn} type="text" placeholder="ESN or A/C Register" />
	</div>
</div>

<div class="mt-6" class:hidden={borrowingData.movement.user_id === 'x'}>
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Borrowing Items</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<div class="mt-3 overflow-x-auto text-base/6 sm:text-sm/6">
		<div class="my-3 flex w-fit justify-start">
			<Label for="label" class="w-full">Add New Item <ScanBarcode class="size-5" /></Label>
			<Input
				id="label"
				name="label"
				type="text"
				placeholder="Input Label"
				bind:value={stockLabel}
				onkeypress={(e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						addToTray(stockLabel);
						stockLabel = '';
					}
				}} />
		</div>

		{#each borrowingData.items as item (item.stock_item_id)}
			<div class="">
				{#await getStockItemById(item.stock_item_id)}
					<div class="flex gap-3">
						<Skeleton class="h-9 w-75" />
						<Skeleton class="h-9 w-32" />
					</div>
				{:then result}
					{#if result.status === 'success'}
						<BorrowItemViewTemporary stockItem={result.data} bind:items={borrowingData.items} />
					{/if}
				{/await}
			</div>
		{/each}
		{#if isQuering}
			<div class="flex gap-3">
				<Skeleton class="h-9 w-75" />
				<Skeleton class="h-9 w-32" />
			</div>
		{/if}

		<Button class="mt-14 max-w-80 cursor-pointer bg-lime-400 hover:bg-lime-300 dark:bg-lime-600 dark:hover:bg-lime-500" disabled={borrowingData.items.length || delayedItem ? false : true} onclick={save}>
			{#if delayedItem}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Saving...
			{:else}
				<Save class="h-4 w-4" />
				Save
			{/if}
		</Button>
	</div>
</div>

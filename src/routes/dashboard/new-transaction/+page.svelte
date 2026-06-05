<script lang="ts">
	import { BookmarkCheck, BookmarkX, CalendarPlus, LoaderCircle, ScanBarcode } from '@lucide/svelte';
	import { checkOut, getStockItemByLabel, getStockItemById, getUserDetail } from './transaction.remote';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { clock } from '$lib/clock.svelte';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';

	import { BorrowMovementStatus, type User } from '$lib/CostumTypes';

	let borrowingData = $state({
		basicData: {
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
		const res = await getUserDetail(employeeId);
		if (res.status === 'failed') {
			userData = null;
			getUserLoading = false;
			return;
		} else {
			userData = res.data as User;
			getUserLoading = false;
		}
	}

	let stockLabel = $state('');
	let isQuering = $state(false);

	$effect(() => {
		if (userData) {
			borrowingData.basicData.user_id = userData.id;
		} else {
			borrowingData.basicData.user_id = '';
		}
	});

	async function addToTray(stockLabel: string) {
		try {
			isQuering = true;

			let result = await getStockItemByLabel(stockLabel); // check availability in system
			if (!result) {
				toast('Stock Item not found');
				return;
			}

			const existingItem = borrowingData.items.find((stock) => stock.label === result.label);

			if (existingItem) {
				if (result.quantity === existingItem.quantity_out) {
					toast('Max allowed quantity for this material to borrow reached');
				} else {
					existingItem.quantity_out += 1;
				}
			} else {
				borrowingData.items.push({ label: result.label, stock_item_id: result.id, quantity_out: 1 });
			}
		} catch (error) {
			console.error(error);
			toast('An unexpected error occurred');
		} finally {
			isQuering = false;
		}
	}

	async function save() {
		if (borrowingData.basicData.user_id === '') {
			toast.error('Employee ID is required');
			return;
		}

		delayedItem = true;
		await checkOut({
			basicData: borrowingData.basicData,
			itemData: borrowingData.items
		})
			.then((result) => {
				result.forEach((res) => {
					if (res.message) {
						toast.info(res.message);
					} else {
						toast.info(res.status);
					}
				});
			})
			.catch((err) => {
				toast.error(err);
			})
			.finally(() => {
				delayedItem = false;
				goto('/dashboard');
			});
	}

	$inspect(borrowingData);
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
		<Input id="order_number" name="order_number" bind:value={borrowingData.basicData.order_number} type="text" placeholder="Order Number" />
	</div>
	<div class="flex w-full max-w-sm flex-col gap-1.5">
		<Label for="esn">ESN or A/C Register</Label>
		<Input id="esn" name="esn" bind:value={borrowingData.basicData.esn} type="text" placeholder="ESN or A/C Register" />
	</div>
</div>

<div class="mt-6" class:hidden={borrowingData.basicData.user_id === 'x'}>
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Borrowing Items</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<div class="mt-3 flex w-full flex-col text-base/6 sm:text-sm/6">
		<div class="mb-3 flex w-fit flex-col justify-start gap-2">
			<Label for="label">Label <ScanBarcode class="size-5" /></Label>
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
			<div class="mb-3 flex w-full flex-row items-center justify-start gap-2">
				{#await getStockItemById(item.stock_item_id)}
					<div class="flex gap-3">
						<Skeleton class="h-9 w-75" />
						<Skeleton class="h-9 w-32" />
					</div>
				{:then result}
					{#if result && result.status === 'success'}
						<div class="flex h-9 items-center gap-3 rounded-md border border-foreground/70 px-3 text-xs">
							<p>{result.data.expand?.stock_master_id.expand.material_master_id.part_number}</p>
							<p class="border-l border-foreground/70 pl-3">{result.data.expand?.stock_master_id.expand.material_master_id.description}</p>
							<p class="border-l border-foreground/70 pl-3">Available Quantity - {result.data.quantity} {result.data.expand?.stock_master_id.expand.material_master_id.expand.material_unit_id.code}</p>
						</div>
						<div class="flex h-9 items-center gap-3 rounded-md border border-foreground/70 bg-lime-300 px-3 text-xs">
							<p>Borrowed Quantity - {item.quantity_out}</p>
						</div>
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

		<Button class="mt-14 max-w-80 cursor-pointer" disabled={borrowingData.items.length || delayedItem ? false : true} onclick={save}>
			{#if delayedItem}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Saving...
			{:else}
				Save {borrowingData.items.length}
			{/if}
		</Button>
	</div>
</div>

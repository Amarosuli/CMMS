<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	import { time } from '$lib/helpers';
	import { CalendarPlus, ChevronLeft, LoaderCircle, ScanBarcode } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { getStockItem, getUserDetail } from './transaction.remote';
	import type { StockMaster, User } from '$lib/CostumTypes';
	import Scanner from './Scanner.svelte';

	let borrowingData = $state({
		basicData: {
			user_id: '',
			order_number: '',
			esn: '',
			status: 'OPEN'
		},
		items: [] as { stock_id: string; quantity_out: number }[]
	});

	let isLoading = $state(false);
	let delayedItem = $state(false);
	let FormItem: string[] = $state([]);

	let userId = $state('');
	let userData: User | null = $state(null);
	let getUserLoading = $state(false);

	async function doneTyping() {
		getUserLoading = true;
		const res = await getUserDetail(userId);
		if (res.status === 'fail') {
			userData = null;
			getUserLoading = false;
			return;
		} else {
			userData = res.data as User;
			getUserLoading = false;
		}
	}

	let isScanning = $state(false);
	let initValue = $state('');

	$effect(() => {
		if (userData) {
			console.log('jo');

			borrowingData.basicData.user_id = userData.id;
		} else {
			console.log('de');
			borrowingData.basicData.user_id = '';
		}

		console.log(dada);
	});

	let dada = $derived(() => {
		let dummy = [] as StockMaster[];
		FormItem.forEach(async (item) => {
			let result = await getStockItem(item);
			dummy = [...dummy, result];
		});
		return dummy;
	});
</script>

<svelte:head>
	<title>CMMS - New Transaction</title>
</svelte:head>

{#if isScanning}
	<Scanner bind:isScanning />
{/if}

{JSON.stringify(borrowingData)}

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">New <span class="text-foreground/50">Transaction</span></h1>
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

<form method="POST" class="mt-4 space-y-3">
	<div class="flex items-center gap-4">
		<div class="flex w-full max-w-sm flex-col gap-1.5">
			<Label for="user_id">Employee ID</Label>
			<Input id="user_id" name="user_id" bind:value={userId} type="text" placeholder="Employee ID" onblur={doneTyping} />
		</div>
		{#if getUserLoading}
			<p class="text-foreground/50 text-sm/4">Get user detail...</p>
		{:else}
			<div class="mt-4">
				<p class="text-foreground/50 text-sm/4">Name: {userData?.name}</p>
				<p class="text-foreground/50 text-sm/4">Unit: {userData?.unit}</p>
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
</form>

{FormItem}

<div class="mt-6">
	<h2 class="text-foreground text-base/7 font-semibold sm:text-sm/6">
		Borrowing Items <Button
			variant="outline"
			class="ml-4 bg-sky-300/80 hover:bg-sky-300 dark:bg-sky-400/50 dark:hover:bg-sky-400/80"
			onclick={() => {
				isScanning = !isScanning;
			}}><ScanBarcode class="size-4" /> Scanner</Button>
	</h2>
	<hr role="presentation" class="border-foreground/10 mt-4 w-full border-t" />
	<div class="mt-3 flex w-full flex-col text-base/6 sm:text-sm/6">
		{#each dada() as item, i}
			<div class="mb-3 flex w-full flex-row items-center justify-start gap-2">
				<Input class="w-fit " name="batch_number_{i}" value={FormItem[i]} type="text" placeholder="Batch Number" />
				<!-- {#await getStockItem(FormItem[i])}
					<LoaderCircle class="text-primary h-4 w-4 animate-spin" />
				{:then result} -->
				<div class="border-foreground/70 flex h-9 items-center gap-3 rounded-md border px-3 text-sm">
					<p>{item.expand?.material_id.part_number}</p>
					<p class="border-foreground/70 border-l pl-3">{item.expand?.material_id.description}</p>
					<p class="border-foreground/70 border-l pl-3">Available Quantity - {item.quantity_available} {item.expand?.material_id.expand?.unit_id.code}</p>
				</div>
				<div class="border-foreground/70 flex h-9 items-center gap-3 rounded-md border px-3 text-sm">
					<p>Borrowed Quantity -</p>
				</div>
				<!-- {/await} -->
			</div>
		{/each}
		<div class="mb-3 flex w-fit flex-row justify-start gap-2">
			<Input
				name="batch_number"
				type="text"
				placeholder="Batch Number"
				bind:value={initValue}
				onkeypress={(e) => {
					if (e.key === 'Enter') {
						if (initValue) {
							FormItem = [...FormItem, initValue];
						}
						initValue = '';
					}
				}} />
		</div>

		<Button class="mt-4 max-w-80" disabled={delayedItem ? true : false}>
			{#if delayedItem}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Saving...
			{:else}
				Save
			{/if}
		</Button>
		<!-- {#if $MessageItem}
				<p class="mt-2 bg-destructive p-2 text-center text-xs font-semibold text-destructive-foreground">{$MessageItem}</p>
			{/if} -->
	</div>
</div>

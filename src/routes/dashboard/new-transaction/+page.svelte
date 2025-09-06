<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';

	import { time } from '$lib/helpers';
	import { CalendarPlus, ChevronLeft, LoaderCircle, ScanBarcode } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { checkOut, getStockByBatchNumber, getStockById, getUserDetail } from './transaction.remote';
	import type { BorrowStatus, StockMaster, User } from '$lib/CostumTypes';
	import Scanner from './Scanner.svelte';
	import { toast } from 'svelte-sonner';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	let borrowingData = $state({
		basicData: {
			user_id: '',
			order_number: '',
			esn: '',
			status: 'OPEN' as BorrowStatus
		},
		items: [] as { borrow_id?: string; stock_id: string; quantity_out: number }[]
	});

	let isLoading = $state(false);
	let delayedItem = $state(false);
	let FormItem: string[] = $state([]);

	let userId = $state('');
	let userData: User | null = $state(null);
	let getUserLoading = $state(false);
	let isTyping = $state(false);

	async function doneTyping() {
		isTyping = false;
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
	let isQuering = $state(false);

	$effect(() => {
		if (userData) {
			console.log('jo');
			borrowingData.basicData.user_id = userData.id;
		} else {
			console.log('de');
			borrowingData.basicData.user_id = '';
		}
	});

	async function addToTray(batchNumber: string) {
		isQuering = true;
		let result = await getStockByBatchNumber(batchNumber);
		if (result && result.status === 'success') {
			const isDuplicate = borrowingData.items.find((stock) => {
				if (stock.stock_id === result.data?.id) {
					stock.quantity_out += 1;
					return true;
				}
				return false;
			});
			isQuering = false;
			if (!isDuplicate) borrowingData.items.push({ stock_id: result.data?.id as string, quantity_out: 1 });
		} else {
			isQuering = false;
			return;
		}
	}

	async function save() {
		delayedItem = true;
		await checkOut({
			basicData: borrowingData.basicData,
			itemData: borrowingData.items.map((item) => {
				return {
					borrow_id: borrowingData.basicData.user_id,
					stock_id: item.stock_id,
					quantity_out: item.quantity_out
				};
			})
		})
			.then((result) => {
				result.forEach((res) => {
					toast.info(`${(res.status, res.message)}`);
				});
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				delayedItem = false;
				goto('/dashboard');
			});
	}
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
			<Input id="user_id" name="user_id" bind:value={userId} type="text" placeholder="Employee ID" onfocus={() => (isTyping = true)} onblur={doneTyping} />
		</div>
		{#if getUserLoading}
			<div class="mt-4">
				<p class="text-foreground/50 text-sm/4">Get employee detail...</p>
			</div>
		{:else}
			<div class="mt-4">
				{#if userData}
					<p class="text-foreground/50 text-sm/4">Name: {userData?.name}</p>
					<p class="text-foreground/50 text-sm/4">Unit: {userData?.unit}</p>
				{:else}
					<p class="text-foreground/50 text-sm/4">{isTyping ? '' : 'No Employee Data Found'}</p>
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
		<div class="mb-3 flex w-fit flex-col justify-start gap-2">
			<Label for="batch_number">Batch Number</Label>
			<Input
				id="batch_number"
				name="batch_number"
				type="text"
				placeholder="Input Batch Number"
				bind:value={initValue}
				onkeypress={(e) => {
					if (e.key === 'Enter') {
						addToTray(initValue);
						initValue = '';
					}
				}} />
		</div>

		{#each borrowingData.items as item, i}
			<div class="mb-3 flex w-full flex-row items-center justify-start gap-2">
				{#await getStockById(item.stock_id)}
					<div class="flex gap-3">
						<Skeleton class="h-9 w-[300px]" />
						<Skeleton class="h-9 w-32" />
					</div>
				{:then result}
					<div class="border-foreground/70 flex h-9 items-center gap-3 rounded-md border px-3 text-xs">
						<p>{result.data?.expand?.material_id.part_number}</p>
						<p class="border-foreground/70 border-l pl-3">{result.data?.expand?.material_id.description}</p>
						<p class="border-foreground/70 border-l pl-3">Available Quantity - {result.data?.quantity_available} {result.data?.expand?.material_id.expand?.unit_id.code}</p>
					</div>
					<div class="border-foreground/70 flex h-9 items-center gap-3 rounded-md border bg-lime-300 px-3 text-xs">
						<p>Borrowed Quantity - {item.quantity_out}</p>
					</div>
				{/await}
			</div>
		{/each}
		{#if isQuering}
			<div class="flex gap-3">
				<Skeleton class="h-9 w-[300px]" />
				<Skeleton class="h-9 w-32" />
			</div>
		{/if}

		<Button class="mt-4 max-w-80 cursor-pointer" disabled={delayedItem ? true : false} onclick={save}>
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

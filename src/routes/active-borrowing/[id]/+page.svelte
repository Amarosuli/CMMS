<script lang="ts">
	import { BorrowDataView, BorrowItemView, BorrowDataDelete, BorrowDataEdit, BorrowItemViewTemporary } from '$lib/components/costum';
	import { ChevronLeft, Pencil, Trash, LoaderCircle, Info, ScanBarcode, Save } from '@lucide/svelte';
	import { getStockItemByLabel, getStockItemById, addBorrowItem } from '$lib/remote-function/borrow.remote';
	import { StockItemStatus } from '$lib/CostumTypes.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data } = $props();

	let isDeleteDataOpen: boolean = $state(false);
	let isEditDataOpen: boolean = $state(false);
	let isLoading: boolean = $state(false);
	let stockLabel = $state('');
	let isQuering = $state(false);
	let items = $state([] as { label: string; stock_item_id: string; quantity_out: number }[]);
	let stockIds: { stock_item_id: string }[] = $state([]);

	$effect(() => {
		stockIds = data.borrowItems.map((item) => {
			return { stock_item_id: item.stock_item_id };
		});
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
				toast.info('Item already disposed.');
				isQuering = false;
				return;
			}

			const existingBorrowItem = data.borrowItems.find((item) => item.stock_item_id === result.data.id);
			const existingItem = items.find((stock) => stock.label === result.data.label);

			if (existingBorrowItem) {
				toast.info('Item already in tray');
				isQuering = false;
				return;
			}

			if (result.data.isBorrowed) {
				toast.info('Item already borrowed by other user');
				isQuering = false;
				return;
			}

			if (existingItem) {
				toast.info('Item already in tray');
				isQuering = false;
				return;
			} else {
				toast.success('Item added');
				items.push({ label: result.data.label, stock_item_id: result.data.id, quantity_out: result.data.size });
			}
		} catch (err) {
			console.error(err);
			toast.error('An unexpected error occurred');
		} finally {
			isQuering = false;
		}
	}
	async function save() {
		if (items.length === 0) return;
		isLoading = true;

		await addBorrowItem({ items, borrowMovementId: data.borrowData.id })
			.then((result) => {
				toast.success(result.message);
			})
			.catch((err) => {
				console.error(err);
				toast.error('An unexpected error occurred');
			})
			.finally(() => {
				isLoading = false;
				goto(page.url.searchParams.get('fromUrl') || '/');
			});
	}
</script>

<svelte:head>
	<title>CMMS - Detail Borrowing</title>
</svelte:head>

<div>
	<Button href={page.url.searchParams.get('fromUrl') || '/active-borrowing'} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>{page.url.searchParams.get('fromUrl') ? 'Return Material' : 'Active Borrowing'}</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Detail <span class="text-foreground/50">Borrowing</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-hover:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 forced-colors:outline">{data.borrowData.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<Info class="size-4" />
				<span>Manage the borrowing data</span></span>
		</div>
	</div>
</div>

<BorrowDataDelete bind:open={isDeleteDataOpen} borrowItems={data.borrowItems} borrowData={data.borrowData} />
<BorrowDataEdit bind:open={isEditDataOpen} borrowData={data.borrowData} />

<div class="relative mt-12">
	<h2 class="flex-1 text-base/7 font-semibold text-foreground sm:text-sm/6">Borrowing Data</h2>
	<div class="absolute top-0 right-0 flex gap-2">
		<Button size="icon" onclick={() => (isEditDataOpen = !isEditDataOpen)} variant="outline">
			<Pencil class="h-4 w-4 text-lime-500" />
		</Button>
		<Button size="icon" onclick={() => (isDeleteDataOpen = !isDeleteDataOpen)} variant="outline">
			<Trash class="h-4 w-4 text-destructive" />
		</Button>
	</div>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<BorrowDataView borrowData={data.borrowData} />
</div>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Borrowing Items</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<div class="overflow-x-auto">
		{#each data.borrowItems as item}
			<BorrowItemView {item} bind:stockIds />
		{/each}
		<h2 class="mt-6 text-base/7 font-semibold text-foreground sm:text-sm/6">New Items</h2>
		<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
		{#each items as item (item.stock_item_id)}
			<div class="">
				{#await getStockItemById(item.stock_item_id)}
					<div class="flex gap-3">
						<Skeleton class="h-9 w-75" />
						<Skeleton class="h-9 w-32" />
					</div>
				{:then result}
					{#if result.status === 'success'}
						<BorrowItemViewTemporary stockItem={result.data} bind:items />
					{/if}
				{/await}
			</div>
		{/each}
	</div>

	<div class="mt-6 mb-3 flex w-fit justify-start">
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
		{#if isQuering}
			<LoaderCircle class="h-4 w-4 animate-spin" />
		{/if}
	</div>
	<Button variant="outline" disabled={items.length === 0} class="mt-4 flex w-fit cursor-pointer gap-2 bg-lime-400 hover:bg-lime-300 dark:bg-lime-600 dark:hover:bg-lime-500" onclick={save}>
		{#if isLoading}
			<LoaderCircle class="h-4 w-4 animate-spin" />
		{:else}
			<Save class="h-4 w-4" />
		{/if}
		Save
	</Button>
</div>

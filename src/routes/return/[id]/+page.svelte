<script lang="ts">
	import { CalendarPlus, ChevronLeft, Eye, Plus, Minus, LoaderCircle } from '@lucide/svelte';
	import { ConfirmDialog } from '$lib/components/costum';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers';
	import { pb } from '$lib/pocketbaseClient.js';
	import { page } from '$app/state';

	import type { StockMaster } from '$lib/CostumTypes.js';

	let { data } = $props();
	let open: boolean = $state(false);

	// let arrayQuantityOut = writable(data.detail);
	let arrayQuantityOut = $state(data.detail);

	async function updateQtyReturn(id: string, stock: StockMaster, quantity_out: number, quantity_return: number) {
		pb.collection('borrow_item')
			.update(id, { quantity_return: quantity_return, date_return: new Date().toUTCString() })
			.then(() => {})
			.catch((error) => {
				toast.error(error.message);
			});
	}
	async function updateBorrowMovement() {
		pb.collection('borrow_movement')
			.update(data.borrowId, { status: 'PENDING' })
			.then(() => {
				toast.success('Checkout successfully');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	// checkOut will update quantity_return as production input and status of borrow_movement to PENDING
	async function checkOut() {
		let chainedPromise = Promise.resolve();
		const promiseArr = arrayQuantityOut.map((item) => {
			return (chainedPromise = chainedPromise.then(() => {
				return updateQtyReturn(item.id, item.stock, item.quantity_out, item.quantity_return);
			}));
		});

		const result = await Promise.all(promiseArr);
		Promise.resolve(result)
			.then(() => updateBorrowMovement())
			.finally(() => goto('/return'));
	}
</script>

<ConfirmDialog title="This action means the material returned is in accordance to the actual" bind:open onConfirm={() => checkOut()} />

<div>
	<Button href={page.url.searchParams.get('fromUrl') || '/return'} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>List Transaction</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Crosscheck <span class="text-foreground/50">Before Return</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 forced-colors:outline"></span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
	</div>
</div>

<div class="mt-12 flex flex-col gap-4">
	<div>
		<p>Make sure the return quantity of each material is correct before Check Out.</p>
	</div>
	{#each arrayQuantityOut as item}
		<div class="flex flex-col rounded border p-4 text-sm md:flex-row md:items-center">
			<div class="flex flex-1 flex-col">
				<p class="">Purchase Order : {item.stock.purchase_order}</p>
				<p class="">Batch Number : {item.stock.batch_number}</p>
			</div>
			<div class="flex flex-1 flex-col">
				<p class="">Part Number : {item.material.part_number}</p>
				<p class="">Part Description : {item.material.description}</p>
			</div>
			<div class="mt-2 flex items-center gap-2 md:justify-center">
				<p class="p-4">Out : {item.quantity_out} {item.unit.code || ''}</p>
				<Button
					variant="outline"
					size="icon"
					onclick={() => {
						if (item.quantity_return != 0) item.quantity_return--;
					}}><Minus class="h-4 w-4" /></Button>
				<Button class={item.quantity_out === item.quantity_return ? 'bg-lime-500 dark:bg-lime-800' : 'bg-red-500'}>
					Return : {item.quantity_return}
					<span class="w-4">
						{item.unit.code || ''}
					</span>
				</Button>
				<Button
					variant="outline"
					size="icon"
					onclick={() => {
						if (item.quantity_return < item.quantity_out) item.quantity_return++;
					}}><Plus class="h-4 w-4" /></Button>
			</div>
		</div>
	{/each}
	{#if !arrayQuantityOut.length}
		<p class="text-primary">No Material Borrowed. Remove this transaction.</p>
	{/if}
</div>

<div class="mt-4">
	<Button variant="outline" class="outline-primary" onclick={() => (open = !open)}>Return</Button>
</div>

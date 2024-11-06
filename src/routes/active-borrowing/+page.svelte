<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import { CalendarPlus, ChevronLeft, Eye, Pencil, LoaderCircle, SquareUser } from 'lucide-svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { deserialize } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import { time } from '$lib/helpers.js';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbaseClient';

	import type { RecordModel } from 'pocketbase';
	import type { StockMaster } from '$lib/CostumTypes.js';

	export let data;

	const { openBorrowing } = data;

	let borrowedItems: RecordModel[] = [];
	let open: boolean = false;
	let isDrawerOpen: boolean = false;

	async function getBorrowedItems(borrowId: string) {
		let result = await pb.collection('borrow_item').getFullList({ filter: 'borrow_id="' + borrowId + '"', expand: 'stock_id.material_id.unit_id' });
		borrowedItems = result.map((item) => {
			return { ...item, stock: item.expand?.stock_id, material: item.expand?.stock_id.expand.material_id, unit: item.expand?.stock_id.expand?.material_id.expand?.unit_id.code };
		});
		isDrawerOpen = false;
	}

	async function drawerOpenHandler(borrowId: string) {
		isDrawerOpen = true;
		getBorrowedItems(borrowId);
		open = !open;
	}

	async function stockOut(data: Record<string, any>) {
		let formData = new FormData();
		for (let key in data) {
			formData.append(key, data[key]);
		}

		const response = await fetch('/movement/stock-out?/updateToStockMaster', {
			method: 'POST',
			body: formData
		});

		return deserialize(await response.text());
	}

	async function updateStockQuantity(id: string, quantity_borrowed: number, quantity_return: number) {
		pb.collection('stock_master')
			.update(id, { quantity_borrowed: quantity_borrowed - quantity_return }) // quantity_borrowed back to before borrowed
			.then(() => {
				toast.success('Checkout successfully');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}
	async function createStockOut(id: string, stock: StockMaster, quantity_out: number, quantity_return: number) {
		pb.collection('stock_out')
			.create({ transaction_type: 'SOUT', stock_id: stock.id, quantity: quantity_out - quantity_return, user_id: data.user?.id, remark: 'Stock out by production', refference_id: id })
			.then(() => {
				stockOut({ stock_id: stock.id, quantity: stock.quantity_borrowed - quantity_return })
					.then(() => {
						pb.collection('stock_master')
							.update(id, {
								quantity_borrowed: stock.quantity_borrowed - quantity_out // quantity_borrowed back to before borrowed
							})
							.then(() => {
								toast.success('Check out successfully');
							})
							.catch((error) => {
								toast.error(error.message);
							});
					})
					.catch((error) => {
						toast.error(error.message);
					});
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function updateBorrowMovement(borrowId: string) {
		pb.collection('borrow_movement')
			.update(borrowId, { status: 'CLOSED' })
			.then(() => {
				toast.success('Checkout successfully');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function process(borrowId: string) {
		let chainedPromise = Promise.resolve();
		const promiseArr = borrowedItems.map((item) => {
			return (chainedPromise = chainedPromise.then(() => {
				if (item.quantity_out === item.quantity_return) {
					return updateStockQuantity(item.stock.id, item.stock.quantity_borrowed, item.quantity_return);
				} else {
					return createStockOut(item.stock.id, item.stock, item.quantity_out, item.quantity_return);
				}
			}));
		});

		const result = await Promise.all(promiseArr);
		Promise.resolve(result)
			.then(() => updateBorrowMovement(borrowId))
			.catch((error) => toast.error(error.message))
			.finally(() => goto('/active-borrowing'));
	}

	async function closeTransaction(borrowId: string) {
		getBorrowedItems(borrowId).then(() => {
			process(borrowId);
		});
	}
</script>

<Drawer.Root bind:open>
	<Drawer.Content class="flex w-full  sm:justify-start lg:justify-center">
		<Drawer.Header>
			<Drawer.Title>Borrowed Items</Drawer.Title>
			<Drawer.Description>Please do crosscheck for each item return.</Drawer.Description>
		</Drawer.Header>
		<div class="h-ful w-full p-4 pb-6">
			<ScrollArea class="h-96 max-h-96">
				<div class="flex w-full flex-col gap-2">
					{#if isDrawerOpen}
						<div transition:fade class="absolute inset-0 flex w-full items-center justify-center gap-2 border-t bg-secondary/50 p-2 pt-4 text-xs md:flex-row md:items-center md:gap-3 lg:w-full">
							<LoaderCircle class="h-4 w-4 animate-spin" />
							<p>Loading...</p>
						</div>
					{:else}
						{#each borrowedItems as item}
							<div class="flex w-full flex-col border-t p-2 pt-4 text-xs md:flex-row md:items-center md:gap-3 lg:w-full">
								<p class="w-full flex-1">Mat. Code : {item.material.code}</p>
								<p class="w-full flex-1 truncate">Mat. Description : {item.material.description}</p>
								<p class="w-full flex-1 max-sm:hidden">Batch : {item.stock.batch_number}</p>
								<p class="w-full flex-1">Purchase Order : {item.stock.purchase_order}</p>
								<p class="w-full max-w-32 truncate">Out Quantity : {item.quantity_out} {item.unit || 'EA'}</p>
								<p class="mb-3 w-full max-w-32 truncate md:mb-0">Return Quantity : {item.quantity_return}</p>
								<Button size="default" variant="outline" class="mr-auto">Save</Button>
							</div>
						{/each}
					{/if}
				</div>
			</ScrollArea>
		</div>
		<Drawer.Footer class="flex w-full items-center justify-center space-y-2">
			<Button size="default" class="w-80 bg-lime-500 text-background">Close Transaction</Button>
			<Drawer.Close>Cancel</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>

<div>
	<Button href="/" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Dashboard</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Active <span class="text-foreground/50">Borrowing</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline"></span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
	</div>
</div>

<div class="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
	{#if openBorrowing.length === 0}
		<p class="inline-flex w-fit items-center rounded-md bg-lime-400/20 p-2 text-sm/5 font-bold text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">Currently no active borrowing</p>
	{/if}
	{#each openBorrowing as borrow}
		<div class="relative">
			<hr role="presentation" class="w-full border-t" />
			<div class="mt-6 font-mono text-sm/3 font-light text-lime-500 sm:text-xs/3">{time(borrow.created, { format: 'ddd, DD MMM YYYY - h:mm A' })}</div>
			<div class=" flex items-center text-lg font-medium sm:text-sm/6"><SquareUser class="mr-2 h-4 w-4" /> {borrow.user.username} - {borrow.user.name}</div>
			<div class="mt-3 text-2xl/8 font-extrabold text-foreground/80 sm:text-xl/8" class:text-lime-500={borrow.status === 'OPEN'} class:text-yellow-500={borrow.status === 'PENDING'}>{borrow.status}</div>
			<div class="mt-3 text-sm/6 sm:text-xs/6">
				<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{borrow.esn || 'No ESN'}</span> <span class="text-zinc-500">{borrow.order_number || 'No Order Number'}</span>
			</div>
			<div class="mt-3 flex flex-col gap-2">
				<div class="flex gap-2">
					<Button variant="outline" class="flex-1" on:click={() => goto('/active-borrowing/' + borrow.id)}>
						<Pencil class="mr-2 h-4 w-4" />
						Edit
					</Button>
					<Button variant="outline" class="flex-1" on:click={() => drawerOpenHandler(borrow.id)}>
						<Eye class="mr-2 h-4 w-4" />
						Detail
					</Button>
				</div>
				<Button variant="outline" on:click={() => closeTransaction(borrow.id)}>Close Transaction</Button>
			</div>
		</div>
	{/each}
</div>

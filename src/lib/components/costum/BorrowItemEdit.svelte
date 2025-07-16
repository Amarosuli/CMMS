<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { LoaderCircle, Check, ChevronsUpDown } from '@lucide/svelte';
	import { tick } from 'svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { borrowItemOutSchema } from '$lib/zodSchema';
	import { invalidateAll } from '$app/navigation';
	import { writable } from 'svelte/store';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { pb } from '$lib/pocketbaseClient';
	import { cn } from '$lib/utils';

	import type { BorrowItem } from '$lib/CostumTypes';

	interface Props {
		open?: boolean;
		item: BorrowItem;
		stockIds: { stock_id: string }[];
		onState: (value: boolean) => void;
	}

	let { open = $bindable(false), item, stockIds, onState = () => {} }: Props = $props();

	let stock: {
		value: string;
		quantity_available: number;
		label: string;
		detail: string;
		unit: string;
	}[] = $state([]);

	let openStock: boolean = false;
	let isSaving: boolean = $state(false);
	let formData = writable<BorrowItem>({} as BorrowItem);

	async function getStockToUpdate() {
		const result = await pb.collection('stock_master').getFullList({ expand: 'material_id.unit_id' });
		result.forEach(({ id, batch_number, expand, quantity_available, quantity_borrowed }) => {
			stock = [
				...stock,
				{
					value: id,
					quantity_available: quantity_available - quantity_borrowed,
					label: batch_number + ' - ' + expand?.material_id.code,
					detail: expand?.material_id.code + ' - ' + expand?.material_id.part_number,
					unit: expand?.material_id.expand?.unit_id.code || ''
				}
			];
		});
	}

	function closeAndFocusTrigger(triggerId: string) {
		openStock = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	function setItemQtyOut(e: Event & { target: HTMLInputElement }) {
		const target = e.target;
		$formData.quantity_out = parseInt(target.value);
	}

	function setItemQtyReturn(e: Event & { target: HTMLInputElement }) {
		const target = e.target;
		$formData.quantity_return = parseInt(target.value);
	}

	async function balanceQtyIfStockDifferent(stock_id: string, quantity_borrowed: number) {
		const stock = await pb.collection('stock_master').getOne(stock_id);
		let finalQty = stock.quantity_borrowed - item.quantity_out;
		pb.collection('stock_master')
			.update(stock_id, { quantity_borrowed: finalQty })
			.then(() => {
				toast.success('Balance old stock successfully!');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function saveItem() {
		let res = borrowItemOutSchema.safeParse({ items: [$formData] });
		if (!res.success) {
			isSaving = false;
			open = false;
			return toast.error('Not valid');
		}
		isSaving = true;
		let data = res.data.items[0];
		console.log(data);

		const { stock_id, quantity_out } = data;
		const stock = await pb.collection('stock_master').getOne(stock_id);
		let finalQty: number = 0;

		if (stock_id === item.stock_id) {
			finalQty = stock.quantity_borrowed - item.quantity_out + quantity_out;
		} else {
			finalQty = $formData.quantity_out;
			await balanceQtyIfStockDifferent(item.stock_id, item.quantity_out);
		}

		if (stock.id) {
			pb.collection('stock_master')
				.update(stock_id, { quantity_borrowed: finalQty })
				.then(() => {
					toast.success('Balancing quantity successfully!');
				})
				.catch((error) => {
					toast.error(error.message);
				});
		}
		pb.collection('borrow_item')
			.update(item.id, data)
			.then(() => {
				toast.success('Update item successfully!');
			})
			.catch((error) => {
				toast.error(error.message);
			})
			.finally(() => {
				onState(true);
				invalidateAll().then(() => {
					onState(false);
				});
				isSaving = false;
				open = false;
			});
	}

	$effect(() => {
		if (open) {
			$formData.id = item.id;
			$formData.borrow_id = item.borrow_id;
			$formData.quantity_out = item.quantity_out;
			$formData.quantity_return = item.quantity_return;
			$formData.stock_id = item.stock_id;
			$formData.date_out = new Date().toUTCString();
			getStockToUpdate();
		} else {
			stock = [];
		}
	});
	let selectedStock = $derived((stock.find((f) => f.value === $formData.stock_id)?.quantity_available || 0) - ($formData.quantity_out - item.quantity_out));
	let stockUnit = $derived(stock.find((f) => f.value === $formData.stock_id)?.unit || '');
	let stockAvailable = $derived(
		stock.filter((v) => {
			return !stockIds.find((t) => t.stock_id === v.value);
		})
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Edit Item</Dialog.Title>
			<Dialog.Description>Please, make sure actual quantity you borrow out</Dialog.Description>
		</Dialog.Header>
		<div class="mt-2 flex w-full flex-col gap-4">
			<form class="flex w-full flex-col" method="post" onsubmit={(e) => e.preventDefault()}>
				<div class="flex flex-col gap-2">
					<p class="mb-[0.15rem] mt-[0.2rem] flex w-fit items-center gap-2 rounded bg-lime-100/30 px-2 py-[0.15rem] text-xs">
						Stock
						{#if selectedStock}
							- Available Qty : {selectedStock} {stockUnit}
						{:else}
							<LoaderCircle class="h-4 w-4 animate-spin" />
						{/if}
					</p>

					<Label for="quantity_out">Quantity Out</Label>
					<Input id="quantity_out" bind:value={$formData.quantity_out} min="1" type="number" placeholder="Quantity Out" onchange={(e: Event & { target: HTMLInputElement }) => setItemQtyOut(e)} />

					<Label for="quantity_return" class="mt-2">Quantity Return</Label>
					<Input id="quantity_return" bind:value={$formData.quantity_return} min="0" max={$formData.quantity_out} type="number" placeholder="Quantity Return" onchange={(e: Event & { target: HTMLInputElement }) => setItemQtyReturn(e)} />
				</div>
				<Button class="mt-4" type="submit" onclick={saveItem} disabled={isSaving ? true : false}>
					{#if isSaving}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin " />
						Saving...
					{:else}
						Save
					{/if}
				</Button>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

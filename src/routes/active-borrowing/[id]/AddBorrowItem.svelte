<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { borrowItemOutSchema } from '$lib/zodSchema';
	import { invalidateAll } from '$app/navigation';
	import { LoaderCircle } from '@lucide/svelte';
	import { writable } from 'svelte/store';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { pb } from '$lib/pocketbaseClient';

	import type { BorrowItem, BorrowMovement } from '$lib/CostumTypes';

	interface Props {
		open?: boolean;
		borrowData: BorrowMovement;
		stockIds: { stock_id: string }[];
		onState: (e: boolean) => void;
	}

	let { open = $bindable(false), borrowData, stockIds = $bindable(), onState = () => {} }: Props = $props();

	let isSaving: boolean = $state(false);
	let formData = writable<BorrowItem>({} as BorrowItem);

	async function saveItem() {
		let res = borrowItemOutSchema.safeParse({ items: [$formData] });
		if (!res.success) {
			return toast.error('Not valid');
		}
		isSaving = true;
		let data = res.data.items[0];

		const stock = await pb.collection('stock_master').getOne(data.stock_id);
		if (stock.id) {
			pb.collection('stock_master')
				.update(stock.id, { quantity_borrowed: stock.quantity_borrowed + data.quantity_out })
				.then(() => {
					toast.success('Balance stock master successfully');
				})
				.catch((error) => {
					toast.error(error.message);
				});
		}

		pb.collection('borrow_item')
			.create(data)
			.then(() => {
				toast.success('Add borrow item successfully');
			})
			.catch((error) => {
				toast.error(error.message);
			})
			.finally(() => {
				onState(true);
				invalidateAll().then(() => {
					onState(false);
				});
				open = false;
				isSaving = false;
			});
	}

	$effect(() => {
		if (!open) {
			isSaving = false;
			$formData.stock_id = '';
			isStockFound = false;
			qtyAvlb = 0;
			inputBarcode = '';
		} else {
			isSaving = isSaving;
			$formData.quantity_out = 1;
			$formData.borrow_id = borrowData.id;
			$formData.date_out = new Date().toUTCString();
		}
	});

	let inputBarcode = $state('');
	let isStockFound = $state(false);
	let qtyAvlb = $state(0);

	async function findStock(e: any) {
		if (e.key === 'Enter') {
			e.preventDefault();
		}

		if (inputBarcode) {
			const result = await pb.collection('stock_master').getFirstListItem(`batch_number = "${inputBarcode}"`);
			if (result.id) {
				qtyAvlb = result.quantity_available - result.quantity_borrowed;
				if (qtyAvlb === 0) {
					return toast.info('Available Stock 0!');
				}
				isStockFound = true;
				$formData.stock_id = result.id;
			}
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Add Item</Dialog.Title>
			<Dialog.Description>Find by PO, Batch Number or Part Number of material</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex w-full flex-col gap-4">
			<form class="flex w-full flex-col" method="post" onsubmit={(e) => e.preventDefault()}>
				<div class="flex flex-col gap-2">
					<Label for="barcode">Barcode {isStockFound ? `- Stock Found ✅ ${qtyAvlb}` : ''}</Label>
					<Input id="barcode" bind:value={inputBarcode} placeholder="Barcode" onkeydown={(e) => findStock(e)} />

					<Input id="stock_id" bind:value={$formData.stock_id} hidden />
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

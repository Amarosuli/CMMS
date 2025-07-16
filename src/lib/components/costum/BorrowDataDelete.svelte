<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { LoaderCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbaseClient';

	import type { BorrowItem, BorrowMovement } from '$lib/CostumTypes';

	interface Props {
		open?: boolean;
		borrowItems: BorrowItem[];
		borrowData: BorrowMovement;
	}

	let { open = $bindable(false), borrowItems, borrowData }: Props = $props();

	let isDeleting: boolean = $state(false);

	function balanceQuantityBorrowed(id: string, quantity_out: number) {
		pb.collection('stock_master')
			.getOne(id)
			.then((res) => {
				let currentQtyBorrowed = res.quantity_borrowed;
				pb.collection('stock_master')
					.update(id, { quantity_borrowed: currentQtyBorrowed - quantity_out })
					.then(() => {
						toast.success('Balancing quantity successfully!');
					})
					.catch((error) => {
						toast.error(error.message);
					});
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	function deleteBorrowData() {
		pb.collection('borrow_movement')
			.delete(borrowData.id)
			.then(() => {
				toast.success('Delete borrow data successfully!');
				goto('/active-borrowing');
				isDeleting = false;
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}
	function deleteHandler() {
		isDeleting = true;
		if (borrowItems.length) {
			borrowItems.forEach((item) => {
				balanceQuantityBorrowed(item.stock_id, item.quantity_out);
			});
			deleteBorrowData();
		} else {
			deleteBorrowData();
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Delete Data</Dialog.Title>
			<Dialog.Description>This will also delete borrow items. Are you sure ?</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex w-full flex-col gap-4">
			<Button class="mt-4" onclick={deleteHandler}>
				{#if isDeleting}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin " />
					Deleting...
				{:else}
					Delete
				{/if}
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

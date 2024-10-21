<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { invalidateAll } from '$app/navigation';
	import { LoaderCircle } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { pb } from '$lib/pocketbaseClient';

	import type { BorrowItem } from '$lib/CostumTypes';

	export let open: boolean = false;
	export let item: BorrowItem;

	let isDeleting: boolean = false;

	async function deleteItem() {
		isDeleting = true;

		const { id, stock_id, quantity_out } = item;
		const stock = await pb.collection('stock_master').getOne(stock_id);
		if (stock.id) {
			pb.collection('stock_master')
				.update(stock_id, { quantity_borrowed: stock.quantity_borrowed - quantity_out })
				.then(() => {
					toast.success('Balancing quantity successfully!');
				})
				.catch((error) => {
					toast.error(error.message);
				});
		}
		pb.collection('borrow_item')
			.delete(id)
			.then((val) => {
				toast.success('Delete item successfully!');
			})
			.catch((error) => {
				toast.error(error.message);
			})
			.finally(() => {
				invalidateAll();
				isDeleting = false;
				open = false;
			});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Delete Item</Dialog.Title>
			<Dialog.Description>Are you sure ?</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex w-full flex-col gap-4">
			<Button class="mt-4" on:click={deleteItem}>
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

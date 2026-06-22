<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { removeBorrowedItem } from '$lib/remote-function/borrow.remote';
	import { invalidateAll } from '$app/navigation';
	import { LoaderCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';

	import type { BorrowItem } from '$lib/CostumTypes';

	interface Props {
		open?: boolean;
		item: BorrowItem;
		onState: (e: boolean) => void;
	}

	let { open = $bindable(false), item, onState = () => {} }: Props = $props();

	let isDeleting: boolean = $state(false);

	async function deleteItem() {
		isDeleting = true;

		const result = await removeBorrowedItem(item);

		if (result.status === 'failed') {
			toast.error(result.message);
		} else {
			toast.success('Delete item successfully!');
		}
		isDeleting = false;
		open = false;

		onState(true);
		invalidateAll().then(() => {
			onState(false);
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
			<Button class="mt-4" onclick={deleteItem}>
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

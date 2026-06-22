<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { deleteOpenBorrowMovement, updateAllStockItemOnDeleteOpenBorrowMovement } from '$lib/remote-function/borrow.remote';
	import { LoaderCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { BorrowItem, BorrowMovement } from '$lib/CostumTypes';

	interface Props {
		open?: boolean;
		borrowItems: BorrowItem[];
		borrowData: BorrowMovement;
	}

	let { open = $bindable(false), borrowItems, borrowData }: Props = $props();

	let isDeleting: boolean = $state(false);

	function deleteHandler() {
		isDeleting = true;
		if (borrowItems.length) {
			updateAllStockItemOnDeleteOpenBorrowMovement(borrowItems)
				.then((res) => {
					toast.info(res.message);
					deleteOpenBorrowMovement(borrowData.id)
						.then((res) => {
							toast.info(res.message);
							goto(page.url.searchParams.get('fromUrl') || '/active-borrowing');
							open = false;
						})
						.catch((error) => {
							toast.error(error.message);
							isDeleting = false;
						});
				})
				.catch((error) => {
					toast.error(error.message);
					isDeleting = false;
				})
				.finally(() => {
					isDeleting = false;
				});
		} else {
			deleteOpenBorrowMovement(borrowData.id)
				.then((res) => {
					toast.info(res.message);
					goto(page.url.searchParams.get('fromUrl') || '/active-borrowing');
					open = false;
				})
				.catch((error) => {
					toast.error(error.message);
				})
				.finally(() => {
					isDeleting = false;
				});
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
			<Button class="mt-4" onclick={deleteHandler} disabled={isDeleting}>
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

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { editBorrowMovement } from '$lib/remote-function/borrow.remote';
	import { invalidateAll } from '$app/navigation';
	import { LoaderCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';

	import type { BorrowMovement } from '$lib/CostumTypes';

	interface Props {
		open?: boolean;
		borrowData: BorrowMovement;
	}

	let { open = $bindable(false), borrowData }: Props = $props();

	let isUpdating: boolean = $state(false);
	let borrowMovement: BorrowMovement = $state({} as BorrowMovement);

	onMount(() => {
		borrowMovement = borrowData;
	});

	function updateBorrowData() {
		isUpdating = true;
		editBorrowMovement({ borrowMovementId: borrowData.id, borrowMovement })
			.then((result) => {
				if (result.status === 'success') {
					toast.success(result.message);
				} else {
					toast.error(result.message);
				}
			})
			.catch((error) => {
				toast.error(error.message);
			})
			.finally(() => {
				invalidateAll();
				isUpdating = false;
				open = false;
			});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Edit Data</Dialog.Title>
			<Dialog.Description>Correction make perfection!</Dialog.Description>
		</Dialog.Header>
		<div class="mt-2 flex w-full flex-col items-center gap-4">
			<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" method="post" onsubmit={(e) => e.preventDefault()}>
				<div class="mb-2 flex flex-col gap-2">
					<Label for="order_number">Order Number</Label>
					<Input id="order_number" bind:value={borrowMovement.order_number} type="text" placeholder="Order Number" disabled={borrowData.borrowingId} />
				</div>

				<div class="mb-2 flex flex-col gap-2">
					<Label for="esn">ESN</Label>
					<Input id="esn" bind:value={borrowMovement.esn} type="text" placeholder="ESN" disabled={borrowData.borrowingId} />
				</div>

				<div class="mb-2 hidden flex-col gap-2">
					<Label for="status">Status</Label>
					<Input id="status" bind:value={borrowMovement.status} type="text" placeholder="Status" />
				</div>

				<div class="mb-2 hidden flex-col gap-2">
					<Label for="user">User</Label>
					<Input id="user" bind:value={borrowMovement.user_id} type="text" placeholder="User Id" />
				</div>
				<Button type="submit" class="mt-4" onclick={updateBorrowData}>
					{#if isUpdating}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin " />
						Updating...
					{:else}
						Update
					{/if}
				</Button>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

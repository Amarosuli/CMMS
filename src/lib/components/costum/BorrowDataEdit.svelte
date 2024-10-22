<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { invalidateAll } from '$app/navigation';
	import { LoaderCircle } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { pb } from '$lib/pocketbaseClient';

	import type { BorrowMovement } from '$lib/CostumTypes';

	export let open: boolean = false;
	export let borrowData: BorrowMovement;

	let isUpdating: boolean = false;
	let formData: BorrowMovement = {} as BorrowMovement;

	formData.esn = borrowData?.esn;
	formData.order_number = borrowData?.order_number;
	formData.user_id = borrowData?.user_id;
	formData.status = borrowData?.status;

	function updateBorrowData() {
		isUpdating = true;
		pb.collection('borrow_movement')
			.update(borrowData.id, formData)
			.then(() => {
				toast.success('Update borrow data successfully!');
				invalidateAll();
				isUpdating = false;
				open = false;
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Edit Data</Dialog.Title>
			<Dialog.Description>Correction make perfection!</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex w-full flex-col gap-4">
			<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" method="post" on:submit|preventDefault>
				<div class="mb-2 flex flex-col gap-2">
					<Label for="order_number">Order Number</Label>
					<Input id="order_number" bind:value={formData.order_number} type="text" placeholder="Order Number" disabled={borrowData.borrowingId} />
				</div>

				<div class="mb-2 flex flex-col gap-2">
					<Label for="esn">ESN</Label>
					<Input id="esn" bind:value={formData.esn} type="text" placeholder="ESN" disabled={borrowData.borrowingId} />
				</div>

				<div class="mb-2 hidden flex-col gap-2">
					<Label for="status">Status</Label>
					<Input id="status" bind:value={formData.status} type="text" placeholder="Status" />
				</div>

				<div class="mb-2 hidden flex-col gap-2">
					<Label for="user">User</Label>
					<Input id="user" bind:value={formData.user_id} type="text" placeholder="User Id" />
				</div>
				<Button type="submit" class="mt-4" on:click={updateBorrowData}>
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

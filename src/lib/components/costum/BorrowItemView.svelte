<script lang="ts">
	import { BorrowItemDelete, BorrowItemEdit } from '.';
	import { Button } from '../ui/button';

	export let item;

	let isEditOpen: boolean = false;
	let isDeleteOpen: boolean = false;
</script>

<BorrowItemEdit bind:open={isEditOpen} {item} />
<BorrowItemDelete bind:open={isDeleteOpen} {item} />

<div class="flex w-screen gap-3 border-b pb-6 pt-2">
	<div class="flex min-w-80 max-w-80 flex-col">
		<p>{item.material.code}</p>
		<p class="text-xs">{item.material.description}</p>
	</div>
	<p class="flex h-full min-w-20 flex-row gap-2 self-center">Qty : {item.quantity_out} {item.material.expand?.unit_id.code ?? ''}</p>
	<div class="flex min-w-40 flex-col">
		<p class="flex h-full flex-row gap-2 self-center text-xs">BN {item.stock.batch_number}</p>
		<p class="flex h-full flex-row gap-2 self-center text-xs">PO {item.stock.purchase_order}</p>
	</div>
	<div class="flex gap-2 text-xs">
		<Button on:click={() => (isEditOpen = !isEditOpen)} variant="outline">Edit</Button>
		<Button on:click={() => (isDeleteOpen = !isDeleteOpen)} variant="outline">Delete</Button>
	</div>
</div>

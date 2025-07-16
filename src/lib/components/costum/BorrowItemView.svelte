<script lang="ts">
	import { BorrowItemDelete, BorrowItemEdit } from '.';
	import { Pencil, Trash, LoaderCircle } from '@lucide/svelte';
	import { Button } from '../ui/button';

	import type { BorrowItem, BorrowMovement } from '$lib/CostumTypes';

	interface Props {
		item: BorrowItem;
		stockIds: { stock_id: string }[];
	}

	let { item, stockIds = $bindable() }: Props = $props();

	let isDeleteOpen: boolean = $state(false);
	let isEditOpen: boolean = $state(false);
	let isLoading: boolean = $state(false);

	function stateHandler(e: boolean) {
		isLoading = e;
	}
</script>

<BorrowItemEdit bind:open={isEditOpen} {item} {stockIds} onState={(e: boolean) => stateHandler(e)} />
<BorrowItemDelete bind:open={isDeleteOpen} {item} onState={(e: boolean) => stateHandler(e)} />

<div class="flex items-center gap-3 border-b py-2">
	<div class="flex min-w-80 max-w-80 flex-col justify-center">
		<p>{item.material.code}</p>
		<p class="text-xs">{item.material.description}</p>
	</div>
	<p class="flex h-full min-w-20 flex-row gap-2 self-center">Qty : {item.quantity_out} {item.material.expand?.unit_id.code ?? ''}</p>
	<p class="flex h-full min-w-20 flex-row gap-2 self-center">Qty : {item.quantity_return} {item.material.expand?.unit_id.code ?? ''}</p>
	<div class="flex min-w-40 flex-col items-center">
		<p class="flex h-full flex-row gap-2 self-center text-xs">BN {item.stock.batch_number}</p>
		<p class="flex h-full flex-row gap-2 self-center text-xs">PO {item.stock.purchase_order}</p>
	</div>
	<div class="flex items-center gap-2 text-xs">
		<Button disabled={isLoading} onclick={() => (isEditOpen = !isEditOpen)} size="icon" variant="outline"><Pencil class="h-4 w-4 text-lime-500" /></Button>
		<Button disabled={isLoading} onclick={() => (isDeleteOpen = !isDeleteOpen)} size="icon" variant="outline"><Trash class="h-4 w-4 text-destructive" /></Button>
		{#if isLoading}
			<LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
		{/if}
	</div>
</div>

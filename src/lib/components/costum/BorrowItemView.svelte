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
	<div class="flex max-w-80 min-w-80 flex-col justify-center">
		<p class="text-xs font-semibold">{item.material.code} - <span class="text-primary">{item.material.part_number}</span></p>
		<p class="text-xs">{item.material.description}</p>
	</div>
	<p class="flex h-full min-w-20 flex-row gap-2 self-center text-sm">Qty : {item.quantity_out} {item.material.expand?.unit_id.code ?? ''}</p>
	<p class="flex h-full min-w-20 flex-row gap-2 self-center text-sm">Qty : {item.quantity_return} {item.material.expand?.unit_id.code ?? ''}</p>
	<div class="ml-auto flex min-w-40 flex-col items-center">
		<p class="flex h-full flex-row gap-2 self-start text-xs">BN <span class="text-primary">{item.stock.batch_number}</span></p>
		<p class="flex h-full flex-row gap-2 self-start text-xs">PO <span>{item.stock.purchase_order}</span></p>
	</div>
	<div class="flex items-center gap-2 text-xs">
		<Button disabled={isLoading} onclick={() => (isEditOpen = !isEditOpen)} size="icon" variant="outline"><Pencil class="h-4 w-4 text-lime-500" /></Button>
		<Button disabled={isLoading} onclick={() => (isDeleteOpen = !isDeleteOpen)} size="icon" variant="outline"><Trash class="text-destructive h-4 w-4" /></Button>
		{#if isLoading}
			<LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
		{/if}
	</div>
</div>

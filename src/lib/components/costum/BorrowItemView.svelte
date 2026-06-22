<script lang="ts">
	import { Trash, LoaderCircle } from '@lucide/svelte';
	import { BorrowItemDelete } from '.';
	import { Button } from '../ui/button';

	import type { BorrowItem } from '$lib/CostumTypes';

	interface Props {
		item: BorrowItem;
		stockIds: { stock_item_id: string }[];
	}

	let { item, stockIds = $bindable() }: Props = $props();

	let isDeleteOpen: boolean = $state(false);
	let isLoading: boolean = $state(false);

	function stateHandler(e: boolean) {
		isLoading = e;
	}
</script>

<BorrowItemDelete bind:open={isDeleteOpen} {item} onState={(e: boolean) => stateHandler(e)} />

<div class="flex items-center gap-3 border-b py-2">
	<div class="flex max-w-80 min-w-80 flex-col justify-center">
		<p class="text-xs font-semibold">Label : <span class="text-primary">{item.expand?.stock_item_id.label}</span></p>
		<p class="text-xs font-semibold">{item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.code} - <span class="text-slate-600 dark:text-slate-200">{item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.part_number}</span></p>
		<p class="text-xs">{item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.description}</p>
	</div>
	<p class="flex h-full min-w-20 flex-row gap-2 self-center text-sm">Size : {item.quantity_out} {item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.expand.material_unit_id.code ?? ''}</p>
	<div class="ml-auto flex min-w-60 flex-col items-center">
		<p class="flex h-full flex-row gap-4 self-start text-xs">Batch Number <span class="text-primary">{item.expand?.stock_item_id.expand.stock_master_id.batch_number}</span></p>
		<p class="flex h-full flex-row gap-4 self-start text-xs">Purchase Order <span>{item.expand?.stock_item_id.expand.stock_master_id.purchase_order || '-'}</span></p>
	</div>
	<div class="flex items-center gap-2 text-xs">
		<Button disabled={isLoading} onclick={() => (isDeleteOpen = !isDeleteOpen)} size="icon" variant="outline"><Trash class="h-4 w-4 text-destructive" /></Button>
		{#if isLoading}
			<LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
		{/if}
	</div>
</div>

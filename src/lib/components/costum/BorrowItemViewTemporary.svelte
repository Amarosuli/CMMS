<script lang="ts">
	import { Trash, LoaderCircle } from '@lucide/svelte';
	import { Skeleton } from '../ui/skeleton';
	import { Button } from '../ui/button';

	import type { StockItem } from '$lib/CostumTypes';

	interface Props {
		stockItem: StockItem;
		items: {
			label: string;
			stock_item_id: string;
			quantity_out: number;
		}[];
	}

	let { stockItem, items = $bindable() }: Props = $props();

	let isLoading: boolean = $state(false);

	function deleteItem() {
		items = items.filter((item) => item.label !== stockItem.label);
	}
</script>

<div class="relative flex items-center gap-3 border-b py-2">
	<div class="flex max-w-80 min-w-80 flex-col justify-center">
		<Skeleton class="absolute top-0 left-0 h-0.5 w-full bg-lime-300" />
		<p class="text-xs font-semibold">Label : <span class="text-primary">{stockItem.label}</span></p>
		<p class="text-xs font-semibold">{stockItem.expand?.stock_master_id.expand.material_master_id.code} - <span class="text-slate-600 dark:text-slate-100">{stockItem.expand?.stock_master_id.expand.material_master_id.part_number}</span></p>
		<p class="text-xs">{stockItem.expand?.stock_master_id.expand.material_master_id.description}</p>
	</div>
	<p class="flex h-full min-w-20 flex-row gap-2 self-center text-sm">Size : {stockItem.size} {stockItem.expand?.stock_master_id.expand.material_master_id.expand.material_unit_id.code ?? ''}</p>
	<div class="ml-auto flex min-w-60 flex-col items-center">
		<p class="flex h-full flex-row gap-4 self-start text-xs">Batch Number <span class="text-primary">{stockItem.expand?.stock_master_id.batch_number}</span></p>
		<p class="flex h-full flex-row gap-4 self-start text-xs">Purchase Order <span>{stockItem.expand?.stock_master_id.purchase_order || '-'}</span></p>
	</div>
	<div class="flex items-center gap-2 text-xs">
		<Button disabled={isLoading} onclick={deleteItem} size="icon" variant="outline"><Trash class="h-4 w-4 text-destructive" /></Button>
		{#if isLoading}
			<LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
		{/if}
	</div>
</div>

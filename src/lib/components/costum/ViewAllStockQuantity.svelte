<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { StockMaster, StockOverview } from '$lib/CostumTypes';
	import { getStockQuantity } from '../../../routes/stock/stock.remote';
	import { Button } from '../ui/button';
	import { toast } from 'svelte-sonner';
	import { Eye } from '@lucide/svelte';

	let { data }: { data: StockOverview } = $props();
	let open: boolean = $state(false);
	let isLoading: boolean = $state(false);

	let detailStockAvailable: StockMaster[] = $state([]);
	async function show() {
		isLoading = true;
		open = true;
		getStockQuantity(data.stock_master_ids)
			.then((data) => {
				detailStockAvailable = data.items;
			})
			.catch((er) => {
				toast.error(er);
			})
			.finally(() => {
				isLoading = false;
			});
	}
</script>

<Button variant="outline" class="-ml-4" onclick={show}>Show</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title class="flex flex-col">
				<p class="text-center">Show all stock for material</p>
				<span class="py-2 text-center text-sm text-primary">{data.description}</span>
			</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-col items-center justify-center">
			{#if !isLoading && detailStockAvailable}
				{#each detailStockAvailable as stock (stock.id)}
					<div class="flex w-full items-center justify-around gap-2 border-t px-4 py-2 text-xs">
						<p><span class="font-bold">{stock.quantity_available}</span> {stock.expand?.material_master_id.expand.material_unit_id.code}</p>
						<p>Available from Batch Number : {stock.batch_number}</p>
						<Button variant="secondary" class="h-7 w-7 hover:border-background hover:bg-foreground/30"><Eye /></Button>
					</div>
				{/each}
			{:else}
				<div class="flex items-center gap-2 border-t px-4 py-2">
					<p>No Stock Found</p>
				</div>
			{/if}
			{#if isLoading}
				<p>Loading...</p>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

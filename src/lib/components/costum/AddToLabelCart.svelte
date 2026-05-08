<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { getStockItemByStockMasterId } from '../../../routes/stock/stock.remote';
	import { Minus, Plus, ShoppingBasket } from '@lucide/svelte';
	import { addToLabelCart, removeFromLabelCart } from '$lib/labelCart.svelte';
	import { onMount } from 'svelte';
	import { Button } from '../ui/button';

	import type { StockItem } from '$lib/CostumTypes';

	let { data } = $props();

	let open: boolean = $state(false);
	let stockItems: StockItem[] = $state([]);

	function show() {
		open = true;
	}

	onMount(() => {
		getStockItemByStockMasterId(data.id).then((res) => {
			if (res) {
				stockItems = res.items;
			}
		});
	});
</script>

<Button variant="outline" size="sm" class="shrink-0 text-xs" onclick={show}><ShoppingBasket class="size-4" />Add to Label Cart</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title><p class="text-center capitalize">Add To Label Cart</p></Dialog.Title>
		</Dialog.Header>
		<div class="flex items-center justify-center pt-2">
			{#if stockItems.length === 0}
				<p>No Stock Item Available</p>
			{:else}
				<div class="flex w-full flex-col gap-4">
					{#each stockItems as stockItem (stockItem.id)}
						<div class="flex w-full justify-around">
							<span>{stockItem.identity}</span>
							<div class="flex gap-2">
								<Button size="sm" variant="outline" onclick={() => addToLabelCart([stockItem])}><Plus class="size-4" /></Button>
								<Button size="sm" variant="outline" onclick={() => removeFromLabelCart(stockItem.identity)}><Minus class="size-4" /></Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<Button
			onclick={() => {
				addToLabelCart(stockItems);
				open = false;
			}}>Add All to Cart</Button>
	</Dialog.Content>
</Dialog.Root>

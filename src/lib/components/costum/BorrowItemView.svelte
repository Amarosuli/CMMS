<script lang="ts">
	import { BorrowItemDelete, BorrowItemEdit } from '.';
	import { Pencil, Trash, LoaderCircle } from 'lucide-svelte';
	import { writable } from 'svelte/store';
	import { Button } from '../ui/button';

	export let item;
	export let stockIds: { stock_id: string }[];

	let isEditOpen: boolean = false;
	let isDeleteOpen: boolean = false;

	let state = writable(false);
	function stateHandler(e: CustomEvent<{ value: boolean }>) {
		$state = e.detail.value;
	}
</script>

<BorrowItemEdit bind:open={isEditOpen} {item} {stockIds} on:state={(e) => stateHandler(e)} />
<BorrowItemDelete bind:open={isDeleteOpen} {item} on:state={(e) => stateHandler(e)} />

<div class="flex items-center gap-3 border-b py-2">
	<div class="flex min-w-80 max-w-80 flex-col justify-center">
		<p>{item.material.code}</p>
		<p class="text-xs">{item.material.description}</p>
	</div>
	<p class="flex h-full min-w-20 flex-row gap-2 self-center">Qty : {item.quantity_out} {item.material.expand?.unit_id.code ?? ''}</p>
	<div class="flex min-w-40 flex-col items-center">
		<p class="flex h-full flex-row gap-2 self-center text-xs">BN {item.stock.batch_number}</p>
		<p class="flex h-full flex-row gap-2 self-center text-xs">PO {item.stock.purchase_order}</p>
	</div>
	<div class="flex items-center gap-2 text-xs">
		<Button disabled={$state} on:click={() => (isEditOpen = !isEditOpen)} size="icon" variant="outline"><Pencil class="h-4 w-4 text-lime-500" /></Button>
		<Button disabled={$state} on:click={() => (isDeleteOpen = !isDeleteOpen)} size="icon" variant="outline"><Trash class="h-4 w-4 text-destructive" /></Button>
		{#if $state}
			<LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
		{/if}
	</div>
</div>

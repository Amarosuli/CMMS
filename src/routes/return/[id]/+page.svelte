<script lang="ts">
	import { CalendarPlus, ChevronLeft } from '@lucide/svelte';
	import { ConfirmDialog } from '$lib/components/costum';
	import { borrowEnd } from '$lib/remote-function/borrow.remote';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers';
	import { page } from '$app/state';

	let { data } = $props();
	let open: boolean = $state(false);

	const { detail, borrowMovementData } = $derived(data);

	let arrayQuantityOut = $state(structuredClone(detail));

	async function checkOut() {
		const items = arrayQuantityOut.map((item) => {
			if (item.quantity_out === 0) {
				return { ...item, quantity_return: item.quantity_return, date_return: new Date().toISOString() };
			}
			return { ...item, quantity_return: item.quantity_return, date_return: new Date().toISOString() };
		});

		if (borrowMovementData.status === 'failed') {
			return toast.info('No user id recorded in borrow movement');
		}

		borrowEnd({ movementId: data.borrowMovementId, userId: borrowMovementData.data.user_id, items })
			.then((result) => {
				toast.info(result.message);
			})
			.catch((error) => {
				toast.error(error.message);
			})
			.finally(() => {
				goto('/dashboard/list-transaction');
			});
	}
</script>

<ConfirmDialog title="This action means the material returned is in accordance to the actual" bind:open onConfirm={() => checkOut()} />

<div>
	<Button href={page.url.searchParams.get('fromUrl') || '/return'} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>List Transaction</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Crosscheck <span class="text-foreground/50">Before Return</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-hover:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-hover:bg-lime-400/15 forced-colors:outline"></span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
	</div>
</div>

<div class="mt-12 flex flex-col gap-4">
	<div>
		<p>Make sure the return quantity of each material is correct before Check Out.</p>
	</div>
	{#each arrayQuantityOut as item (item.id)}
		<div class="flex flex-col rounded border p-4 text-sm md:flex-row md:items-center">
			<div class="flex flex-1 flex-col">
				<p class="">Label : {item.stockItem.label}</p>
				<p class="">Batch Number : {item.stockMaster.batch_number}</p>
			</div>
			<div class="flex flex-1 flex-col">
				<p class="">Part Number : {item.materialMaster.part_number}</p>
				<p class="">Part Description : {item.materialMaster.description}</p>
			</div>
			<div class="mt-2 flex items-center gap-2 md:justify-center">
				<p class="p-4">Size : {item.quantity_out} {item.materialUnit.code || ''}</p>
				<label for={item.id} class="flex items-center gap-2">Material Return ? </label>
				<Switch id={item.id} bind:checked={item.isReturn} />

				<span class={`${item.isReturn ? 'bg-lime-500 dark:bg-lime-800' : 'bg-red-500 dark:bg-red-800'} flex h-8 w-14 items-center justify-center rounded-md font-semibold text-foreground `}>
					{item.isReturn ? 'Yes' : 'No'}
				</span>
			</div>
		</div>
	{/each}
	{#if !arrayQuantityOut.length}
		<p class="text-primary">No Material Borrowed. Remove this transaction.</p>
	{/if}
</div>

<div class="mt-4">
	<Button variant="outline" class="outline-primary" onclick={() => (open = !open)}>Return</Button>
</div>

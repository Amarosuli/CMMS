<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';

	import { BanknoteArrowUp, CalendarPlus, CircleUserRound, Eye, LoaderCircle, Pencil } from '@lucide/svelte';
	import { getActiveBorrowing, getItemFromActiveBorrowing } from '$lib/remote-function/borrow.remote';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';
	import { clock } from '$lib/clock.svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers';

	let isLoading = $state(false);
</script>

<svelte:head>
	<title>CMMS - List Transaction</title>
</svelte:head>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">List <span class="text-foreground/50">Transaction</span></h1>
		{#if isLoading}
			<span transition:fade={{ duration: 200 }} class="ml-4 flex items-center justify-center gap-3">
				<LoaderCircle class="animate-spin text-primary" />
			</span>
		{/if}
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{clock.realtime}</span></span>
		</div>
	</div>
</div>

<div class="relative mt-3 flex w-full flex-col gap-2">
	{#await getActiveBorrowing()}
		<span transition:fade={{ duration: 200 }} class="absolute z-10 ml-4 flex items-center justify-center gap-3">
			<LoaderCircle class="animate-spin text-primary" /> Loading ...
		</span>
	{:then result}
		{#if result.status === 'success'}
			{#each result.data as item (item.id)}
				<div class="relative flex w-full items-center justify-between border border-foreground/30 p-4 pb-16 md:pb-4">
					<div class="flex gap-4 pl-2 text-sm tracking-wider">
						<CircleUserRound class="size-14 text-foreground" />
						<div class="flex flex-col">
							<p class="truncate">({item.expand?.user_id.username}) {item.expand?.user_id.name}</p>
							<p class="flex gap-2 font-semibold">ESN: <span class="font-normal">{item.esn || 'N/A'}</span></p>
							<p class="flex gap-2 font-semibold">Order Number: <span class="font-normal">{item.order_number || 'N/A'}</span></p>
							<p class="flex gap-2 font-semibold">Date Borrowed: <span class="font-normal">{time(item.created)}</span></p>
						</div>
					</div>
					<div class="absolute top-4 right-7 text-2xl/8 font-extrabold text-foreground/80 sm:text-xl/8" class:text-lime-500={item.status === 'OPEN'} class:text-yellow-500={item.status === 'PENDING'}>{item.status}</div>
					<div class="absolute right-7 bottom-4 flex items-center gap-3 md:relative md:right-0 md:bottom-0 md:self-end md:pr-3">
						<Sheet.Root>
							<Sheet.Trigger>
								<Button variant="outline" class="cursor-pointer"><Eye class="size-4 text-green-500" /> Detail</Button>
							</Sheet.Trigger>
							<Sheet.Content side="right" class="sm:min-w-2/3 xl:min-w-3/5 2xl:min-w-2/5">
								<Sheet.Header>
									<Sheet.Title>Borrowed Items</Sheet.Title>
									<Sheet.Description>Please do crosscheck for each item return.</Sheet.Description>
								</Sheet.Header>
								<div class="h-ful w-full p-4 pb-6">
									<ScrollArea class="h-96 max-h-96">
										<div class="flex w-full flex-col gap-2">
											{#await getItemFromActiveBorrowing(item.id)}
												<div transition:fade class="absolute inset-0 flex w-full items-center justify-center gap-2 border-t bg-secondary/50 p-2 pt-4 text-xs md:flex-row md:items-center md:gap-3 lg:w-full">
													<LoaderCircle class="h-4 w-4 animate-spin" />
													<p>Loading...</p>
												</div>
											{:then borrowedItems}
												{#if borrowedItems.status === 'success'}
													{#each borrowedItems.data as item (item.id)}
														<div class="flex items-center justify-between">
															<div class="flex w-full flex-col border-t p-2 pt-4 text-xs lg:w-full">
																<p class="w-full font-semibold">Label : <span class="text-primary">{item.expand?.stock_item_id.label}</span></p>
																<p class="w-full">Code : {item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.code}</p>
																<p class="w-full">Part Number : {item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.part_number}</p>
																<p class="w-full truncate">Description : {item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.description}</p>
																<p class="w-full">Batch Number : {item.expand?.stock_item_id.expand.stock_master_id.batch_number}</p>
																<p class="w-full">Purchase Order : {item.expand?.stock_item_id.expand.stock_master_id.purchase_order}</p>
																<p class="w-full">Size : {item.quantity_out} {item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.expand.material_unit_id.unit || 'EA'}</p>
															</div>
															<img class="size-28 max-md:hidden" src="https://picsum.photos/seed/picsum/400/400" alt="material_image" />
														</div>
													{/each}
												{:else}
													<p>No item borrowed in this transaction</p>
												{/if}
											{/await}
										</div>
									</ScrollArea>
								</div>
								<Sheet.Footer>
									<Sheet.Close>Close</Sheet.Close>
								</Sheet.Footer>
							</Sheet.Content>
						</Sheet.Root>

						<Button variant="outline" class="cursor-pointer " onclick={() => goto(`/active-borrowing/${item.id}?fromUrl=/dashboard/list-transaction`)}><Pencil class="size-4 text-amber-300" /> Edit</Button>
						<Button variant="outline" class="cursor-pointer" onclick={() => goto(`/return/${item.id}?fromUrl=/dashboard/list-transaction`)}><BanknoteArrowUp class="size-4 text-primary" /> Return</Button>
					</div>
				</div>
			{/each}
		{:else}
			<p>Error occured</p>
		{/if}
	{/await}
</div>

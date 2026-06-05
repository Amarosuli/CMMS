<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import { BanknoteArrowUp, CalendarPlus, CircleUserRound, Eye, LoaderCircle, Pencil } from '@lucide/svelte';
	import { getActiveBorrowing, getItemFromActiveBorrowing } from './list-transaction.remote';
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
	{:then data}
		{#if data}
			{#each data as item (item.id)}
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
						<Drawer.Root>
							<Drawer.Trigger>
								<Button variant="outline" class="cursor-pointer"><Eye class="size-4 text-green-500" /> Detail</Button>
							</Drawer.Trigger>
							<Drawer.Content class="flex w-full  sm:justify-start lg:justify-center">
								<Drawer.Header>
									<Drawer.Title>Borrowed Items</Drawer.Title>
									<Drawer.Description>Please do crosscheck each item when return.</Drawer.Description>
								</Drawer.Header>
								<div class="h-ful w-full p-4 pb-6">
									<ScrollArea class="h-96 max-h-96">
										<div class="flex w-full flex-col gap-2">
											{#await getItemFromActiveBorrowing(item.id)}
												<div transition:fade class="absolute inset-0 flex w-full items-center justify-center gap-2 border-t bg-secondary/50 p-2 pt-4 text-xs md:flex-row md:items-center md:gap-3 lg:w-full">
													<LoaderCircle class="h-4 w-4 animate-spin" />
													<p>Loading...</p>
												</div>
											{:then borrowedItems}
												{#each borrowedItems as item}
													{#if borrowedItems.length}
														<div class="flex w-full flex-col border-t p-2 pt-4 text-xs md:flex-row md:items-center md:gap-3 lg:w-full">
															<p class="w-full flex-1">Label : {item.expand?.stock_item_id.label}</p>
															<p class="w-full flex-1">Code : {item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.code}</p>
															<p class="w-full flex-1 truncate">Description : {item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.description}</p>
															<p class="w-full flex-1 max-sm:hidden">Batch Number : {item.expand?.stock_item_id.expand.stock_master_id.batch_number}</p>
															<p class="w-full flex-1">Purchase Order : {item.expand?.stock_item_id.expand.stock_master_id.purchase_order}</p>
															<p class="w-full max-w-32 truncate">Out Quantity : {item.quantity_out} {item.expand?.stock_item_id.expand.stock_master_id.expand.material_master_id.expand.material_unit_id.unit || 'EA'}</p>
															<p class="mb-3 w-full max-w-32 truncate md:mb-0">Return Quantity : {item.quantity_return}</p>
														</div>
													{:else}
														<p>No item borrowed in this transaction</p>
													{/if}
												{/each}
											{/await}
										</div>
									</ScrollArea>
								</div>
								<Drawer.Footer class="flex w-full items-center justify-center space-y-2">
									<Drawer.Close>Close</Drawer.Close>
								</Drawer.Footer>
							</Drawer.Content>
						</Drawer.Root>
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

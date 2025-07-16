<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { LoaderCircle, Check, ChevronsUpDown } from '@lucide/svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { borrowItemOutSchema } from '$lib/zodSchema';
	import { invalidateAll } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { pb } from '$lib/pocketbaseClient';
	import { cn } from '$lib/utils';

	import type { BorrowItem, BorrowMovement } from '$lib/CostumTypes';
	import { useId } from 'bits-ui';

	interface Props {
		open?: boolean;
		borrowData: BorrowMovement;
		stockIds: { stock_id: string }[];
		onState: (e: boolean) => void;
	}

	let { open = $bindable(false), borrowData, stockIds = $bindable(), onState = () => {} }: Props = $props();

	let stock: {
		value: string;
		quantity_available: number;
		label: string;
		detail: string;
		unit: string;
	}[] = $state([]);

	let openStock: boolean = $state(false);
	let isSaving: boolean = $state(false);
	let formData = writable<BorrowItem>({} as BorrowItem);

	onMount(async () => {
		const result = await pb.collection('stock_master').getFullList({ filter: 'quantity_available != "0"', expand: 'material_id.unit_id' });
		result.forEach(({ id, batch_number, expand, quantity_available, quantity_borrowed }) => {
			stock = [
				...stock,
				{
					value: id,
					quantity_available: quantity_available - quantity_borrowed,
					label: batch_number + ' - ' + expand?.material_id.code,
					detail: expand?.material_id.code + ' - ' + expand?.material_id.part_number + ' - (' + quantity_available + ')',
					unit: expand?.material_id.expand?.unit_id.code || ''
				}
			];
		});
	});

	function closeAndFocusTrigger(triggerId: string) {
		openStock = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	function setItemQtyOut(e: Event) {
		let target = e.target as HTMLInputElement;
		$formData.quantity_out = parseInt(target.value);
	}

	async function saveItem() {
		let res = borrowItemOutSchema.safeParse({ items: [$formData] });
		if (!res.success) {
			return toast.error('Not valid');
		}
		isSaving = true;
		let data = res.data.items[0];

		const stock = await pb.collection('stock_master').getOne(data.stock_id);
		if (stock.id) {
			pb.collection('stock_master')
				.update(stock.id, { quantity_borrowed: stock.quantity_borrowed + data.quantity_out })
				.then(() => {
					toast.success('Balance stock master successfully');
				})
				.catch((error) => {
					toast.error(error.message);
				});
		}

		pb.collection('borrow_item')
			.create(data)
			.then(() => {
				toast.success('Add borrow item successfully');
			})
			.catch((error) => {
				toast.error(error.message);
			})
			.finally(() => {
				onState(true);
				invalidateAll().then(() => {
					onState(false);
				});
				open = false;
				isSaving = false;
			});
	}

	let selectedStock: number | null = $state(null);

	let stockUnit = $derived(stock.find((f) => f.value === $formData.stock_id)?.unit || '');
	let stockAvailable = $derived(
		stock.filter((v) => {
			return !stockIds.find((t) => t.stock_id === v.value);
		})
	);
	$effect(() => {
		if (!open) {
			selectedStock = null;
			isSaving = false;
			$formData.stock_id = '';
		} else {
			isSaving = isSaving;
			$formData.quantity_out = 1;
			$formData.borrow_id = borrowData.id;
			$formData.date_out = new Date().toUTCString();
		}
	});

	let triggerId = useId();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Add Item</Dialog.Title>
			<Dialog.Description>Find by PO, Batch Number or Part Number of material</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex w-full flex-col gap-4">
			<form class="flex w-full flex-col" method="post" onsubmit={(e) => e.preventDefault()}>
				<div class="flex flex-col gap-2">
					<Popover.Root bind:open={openStock}>
						<Label class="mb-[0.15rem] mt-[0.2rem] py-[0.15rem]">Stock {selectedStock ? `- Available Qty : ${selectedStock} ${stockUnit}` : ''}</Label>
						<Popover.Trigger id={triggerId} class={cn(buttonVariants({ variant: 'outline' }), 'justify-between truncate', !$formData.stock_id && 'text-muted-foreground')} role="combobox">
							{stock.find((f) => f.value === $formData.stock_id)?.detail ?? 'Select Material'}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Popover.Trigger>
						<input hidden value={$formData.stock_id} name="stock_id" />

						<Popover.Content class="p-0">
							<Command.Root>
								<Command.Input autofocus placeholder="Search Stock..." class="h-9" />
								<Command.Empty>No stock found.</Command.Empty>
								<Command.Group class="max-h-56 overflow-y-auto">
									{#each stockAvailable as stock}
										<Command.Item
											value={stock.detail}
											onSelect={() => {
												$formData.stock_id = stock.value;
												closeAndFocusTrigger(triggerId);
											}}>
											{stock.label}
											<Check class={cn('ml-auto h-4 w-4', stock.value !== $formData.stock_id && 'text-transparent')} />
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>

					<Label for="quantity_out">Quantity Out</Label>
					<Input id="quantity_out" bind:value={$formData.quantity_out} min="1" type="number" placeholder="Quantity Out" onchange={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => setItemQtyOut(e)} />
				</div>
				<Button class="mt-4" type="submit" onclick={saveItem} disabled={isSaving ? true : false}>
					{#if isSaving}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin " />
						Saving...
					{:else}
						Save
					{/if}
				</Button>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

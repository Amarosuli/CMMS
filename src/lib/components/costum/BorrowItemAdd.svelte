<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { borrowItemOutSchema } from '$lib/zodSchema';
	import { onMount, tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { pb } from '$lib/pocketbaseClient';
	// icons
	import { LoaderCircle, Check, ChevronsUpDown } from 'lucide-svelte';

	import type { BorrowItem, BorrowMovement } from '$lib/CostumTypes';

	export let open: boolean = false;
	export let borrowData: BorrowMovement;
	export let stockIds: { stock_id: string }[];

	let stock: {
		value: string;
		quantity_available: number;
		label: string;
		detail: string;
		unit: string;
	}[] = [];

	let openStock: boolean = false;
	let isSaving: boolean = false;
	let formData: BorrowItem = {} as BorrowItem;

	formData.quantity_out = 1;
	formData.borrow_id = borrowData.id;
	formData.date_out = new Date().toUTCString();

	onMount(async () => {
		const result = await pb.collection('stock_master').getFullList({ expand: 'material_id.unit_id' });
		result.forEach(({ id, batch_number, expand, quantity_available, quantity_borrowed }) => {
			stock = [
				...stock,
				{
					value: id,
					quantity_available: quantity_available - quantity_borrowed,
					label: batch_number + ' - ' + expand?.material_id.code,
					detail: expand?.material_id.code + ' - ' + expand?.material_id.part_number,
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
		const target = e.target as HTMLInputElement;
		formData.quantity_out = parseInt(target.value);
	}

	async function saveItem() {
		let res = borrowItemOutSchema.safeParse({ items: [formData] });
		if (!res.success) return toast.error('Not valid');
		isSaving = true;

		const stock = await pb.collection('stock_master').getOne(formData.stock_id);
		if (stock.id) {
			pb.collection('stock_master')
				.update(stock.id, { quantity_borrowed: stock.quantity_borrowed + formData.quantity_out })
				.then(() => {
					toast.success('Balance stock master successfully');
				})
				.catch((error) => {
					toast.error(error.message);
				});
		}

		pb.collection('borrow_item')
			.create(formData)
			.then(() => {
				toast.success('Create borrow item successfully');
			})
			.catch((error) => {
				toast.error(error.message);
			})
			.finally(() => {
				location.reload();
				open = false;
				isSaving = false;
			});
	}

	$: selectedStock = (stock.find((f) => f.value === formData.stock_id)?.quantity_available || 0) - formData.quantity_out;
	$: stockUnit = stock.find((f) => f.value === formData.stock_id)?.unit || '';
	$: stockAvailable = stock.filter((v) => {
		return !stockIds.find((t) => t.stock_id === v.value);
	});
	$: open === false ? (isSaving = false) : (isSaving = isSaving);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Add Item</Dialog.Title>
			<Dialog.Description>...</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex w-full flex-col gap-4">
			<form class="flex w-full flex-col" method="post" on:submit|preventDefault>
				<div class="flex flex-col gap-2">
					<Popover.Root bind:open={openStock} let:ids>
						<Label class="mb-[0.15rem] mt-[0.2rem] py-[0.15rem]">Stock {selectedStock ? `- Available Qty : ${selectedStock} ${stockUnit}` : ''}</Label>
						<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), 'justify-between truncate', !formData.stock_id && 'text-muted-foreground')} role="combobox">
							{stock.find((f) => f.value === formData.stock_id)?.detail ?? 'Select Material'}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Popover.Trigger>
						<input hidden value={formData.stock_id} name="stock_id" />

						<Popover.Content class="p-0">
							<Command.Root>
								<Command.Input autofocus placeholder="Search Stock..." class="h-9" />
								<Command.Empty>No stock found.</Command.Empty>
								<Command.Group class="max-h-56 overflow-y-auto">
									{#each stockAvailable as stock}
										<Command.Item
											value={stock.detail}
											onSelect={() => {
												formData.stock_id = stock.value;
												closeAndFocusTrigger(ids.trigger);
											}}>
											{stock.label}
											<Check class={cn('ml-auto h-4 w-4', stock.value !== formData.stock_id && 'text-transparent')} />
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>

					<Label for="quantity_out">Quantity Out</Label>
					<Input id="quantity_out" bind:value={formData.quantity_out} min="1" type="number" placeholder="Quantity Out" on:change={(e) => setItemQtyOut(e)} />
				</div>
				<Button class="mt-4" type="submit" on:click={saveItem} disabled={isSaving ? true : false}>
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

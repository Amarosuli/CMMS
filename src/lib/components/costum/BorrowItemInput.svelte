<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { FieldErrors, Control, Label, ElementField } from '$lib/components/ui/form';
	import { ChevronsUpDown, Check } from 'lucide-svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { onMount, tick } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { pb } from '$lib/pocketbaseClient';
	import type { SuperFormData } from 'sveltekit-superforms/client';

	export let stockSkip: { id: string | undefined }[];
	export let FItem;
	export let FormItem: SuperFormData<{
		items: {
			stock_id: string;
			quantity_out: number;
			borrow_id: string;
			date_out: string;
		}[];
	}>;
	export let index;

	let stock: {
		value: string;
		quantity_available: number;
		label: string;
		detail: string;
		unit: string;
	}[] = [];
	let open = false;

	onMount(async () => {
		const result = await pb.collection('stock_master').getFullList({ expand: 'material_id.unit_id' });
		result.forEach(({ id, batch_number, expand, quantity_available, quantity_borrowed }) => {
			if (stockSkip) {
				if (stockSkip.find(({ id }) => id === id))
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
			}
		});
	});

	$: stockUnit = stock.find((f) => f.value === $FormItem.items[index].stock_id)?.unit || '';
	$: selectedStock = (stock.find((f) => f.value === $FormItem.items[index].stock_id)?.quantity_available || 0) - $FormItem.items[index].quantity_out;
	$: stockAvailable = stock.filter((v) => {
		return !stockSkip.find((t) => t.id === v.value);
	});

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<ElementField form={FItem} name="items[{index}].stock_id" class="flex w-full max-w-80 flex-col ">
	<Popover.Root bind:open let:ids>
		<Control let:attrs>
			<Label class="mb-[0.15rem] mt-[0.2rem] py-[0.15rem]">Stock {selectedStock ? `- Available Qty : ${selectedStock} ${stockUnit}` : ''}</Label>
			<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), 'justify-between truncate max-sm:max-w-64', !$FormItem.items[index].stock_id && 'text-muted-foreground')} role="combobox" {...attrs}>
				{stock.find((f) => f.value === $FormItem.items[index].stock_id)?.detail ?? 'Select Material'}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Popover.Trigger>
			<input hidden value={$FormItem.items[index].stock_id} name={attrs.name} />
		</Control>
		<FieldErrors class="text-xs italic" />
		<Popover.Content class="p-0">
			<Command.Root>
				<Command.Input autofocus placeholder="Search Stock..." class="h-9" />
				<Command.Empty>No stock found.</Command.Empty>
				<Command.Group class="max-h-56 overflow-y-auto">
					{#each stockAvailable as stock}
						<Command.Item
							value={stock.detail}
							onSelect={() => {
								$FormItem.items[index].stock_id = stock.value;
								closeAndFocusTrigger(ids.trigger);
							}}>
							{stock.label}
							<Check class={cn('ml-auto h-4 w-4', stock.value !== $FormItem.items[index].stock_id && 'text-transparent')} />
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</ElementField>

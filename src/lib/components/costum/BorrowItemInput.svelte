<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { FieldErrors, Control, Label, ElementField } from '$lib/components/ui/form';
	import { ChevronsUpDown, Check } from '@lucide/svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { onMount, tick } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { pb } from '$lib/pocketbaseClient';
	import type { SuperFormData } from 'sveltekit-superforms/client';
	import { useId } from 'bits-ui';

	interface Props {
		stockSkip: { id: string | undefined }[];
		FItem: any;
		FormItem: SuperFormData<{
			items: {
				stock_id: string;
				quantity_out: number;
				borrow_id: string;
				date_out: string;
			}[];
		}>;
		index: any;
	}

	let { stockSkip, FItem, FormItem, index }: Props = $props();

	let stock: {
		value: string;
		quantity_available: number;
		label: string;
		detail: string;
		unit: string;
	}[] = $state([]);
	let open = $state(false);

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

	let stockUnit = $derived(stock.find((f) => f.value === $FormItem.items[index].stock_id)?.unit || '');
	let selectedStock = $derived((stock.find((f) => f.value === $FormItem.items[index].stock_id)?.quantity_available || 0) - $FormItem.items[index].quantity_out);
	let stockAvailable = $derived(
		stock.filter((v) => {
			return !stockSkip.find((t) => t.id === v.value);
		})
	);

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	let triggerId = useId();
</script>

<ElementField form={FItem} name="items[{index}].stock_id" class="flex flex-col">
	<Popover.Root bind:open>
		<Control id={triggerId}>
			{#snippet children({ props })}
				<Label class="mb-[0.15rem] mt-[0.2rem] py-[0.15rem]">Stock {selectedStock ? `- Available Qty : ${selectedStock} ${stockUnit}` : ''}</Label>
				<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), 'w-[15rem] justify-between truncate md:w-full', !$FormItem.items[index].stock_id && 'text-muted-foreground')} role="combobox" {...props}>
					{stock.find((f) => f.value === $FormItem.items[index].stock_id)?.detail ?? 'Select Material'}
					<ChevronsUpDown class="ml-2 h-4 w-4 opacity-50" />
				</Popover.Trigger>
				<input hidden value={$FormItem.items[index].stock_id} name={props.name} />
			{/snippet}
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
								closeAndFocusTrigger(triggerId);
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

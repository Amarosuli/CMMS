<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { FieldErrors, Control, Label, ElementField } from '$lib/components/ui/form';
	import { ChevronsUpDown, Check } from 'lucide-svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils.js';

	export let stock: {
		value: string;
		quantity_available: number;
		label: string;
		detail: string;
		unit: string;
	}[];
	export let FItem;
	export let FormItem;
	export let index;
	let open = false;

	$: stockUnit = stock.find((f) => f.value === $FormItem.items[index].stock_id)?.unit || '';
	$: selectedStock = (stock.find((f) => f.value === $FormItem.items[index].stock_id)?.quantity_available || 0) - $FormItem.items[index].quantity_out;

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
			<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), 'justify-between truncate', !$FormItem.items[index].stock_id && 'text-muted-foreground')} role="combobox" {...attrs}>
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
					{#each stock as stock}
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

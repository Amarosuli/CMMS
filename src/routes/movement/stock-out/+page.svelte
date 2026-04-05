<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { LoaderCircle, ChevronLeft, CalendarPlus, ChevronsUpDown, Check } from '@lucide/svelte';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { GetStockOption } from '../movement.remote.js';
	import { superForm } from 'sveltekit-superforms';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { useId } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers.js';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils.js';

	let { data } = $props();

	const { user } = $derived(data);

	const form = superForm((() => data.form)(), {
		onSubmit({ cancel }) {
			if (Math.sign(Number(remainingStock)) === -1) {
				toast.error('Stock out quantity is over than available quantity.');
				cancel();
			}
		},
		onUpdate({ form }) {
			if (form.valid) {
				toast.success(form.message.text);
				return goto('/stock');
			}
		}
	});

	const { form: formData, delayed, message, enhance } = form;

	let open = $state(false);
	let filterStock = $state('');
	const foundStock = $derived(await GetStockOption(filterStock));
	let selectedStock = $derived(foundStock.find((f) => f.value === $formData.stock_item_id));
	let remainingStock = $derived(selectedStock?.detail?.quantity?.toString() ?? '0');

	const triggerId = useId();

	$effect(() => {
		$formData.user_id = user ? user.id : '';
	});

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<svelte:head>
	<title>CMMS - Stock Out</title>
</svelte:head>

<div>
	<Button href="/stock" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Stock Available</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Create <span class="text-foreground/50">Stock Out</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-hover:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-hover:bg-lime-400/15 forced-colors:outline">SOUT</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
	</div>
</div>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Stock Out Form Field</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" action="?/save" method="post" use:enhance>
		<Field {form} name="stock_item_id" class="flex flex-col">
			<Popover.Root bind:open>
				<Control id={triggerId}>
					{#snippet children({ props })}
						<Label>Stock <span class="rounded-sm bg-yellow-200 px-2 text-xs text-foreground dark:text-background">{remainingStock ? `Available Qty : ${(Number(remainingStock) - $formData.quantity).toString()} ${selectedStock?.detail.unit || ''}` : ''}</span></Label>
						<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), ' justify-between overflow-hidden', !$formData.stock_item_id && 'text-muted-foreground')} role="combobox" {...props}>
							<p class="truncate">{foundStock.find((f) => f.value === $formData.stock_item_id)?.detail.description ?? 'Select Material'}</p>
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Popover.Trigger>
						<input hidden value={$formData.stock_item_id} name={props.name} />
					{/snippet}
				</Control>
				<Popover.Content class="p-0">
					<Command.Root shouldFilter={false}>
						<Command.Input
							autofocus
							bind:value={filterStock}
							oninput={() => {
								$formData.stock_item_id = '';
							}}
							placeholder="Search Stock..."
							class="h-9" />
						<Command.Empty>No stock found.</Command.Empty>
						<Command.Group class="max-h-56 overflow-y-auto">
							{#each foundStock as stock (stock.detail.identity)}
								<Command.Item
									value={stock.value}
									onSelect={() => {
										$formData.stock_item_id = stock.value;
										closeAndFocusTrigger(triggerId);
									}}>
									<div class="flex flex-col">
										<p class="block w-full text-xs">{stock.detail?.code}</p>
										<p class="block w-full text-xs">{stock.detail?.description}</p>
										<p class="block w-full text-xs capitalize">{stock.detail?.part_number}</p>
										<p class="block w-full text-xs text-primary">{stock.detail.identity}</p>
									</div>
									<Check class={cn('ml-auto h-4 w-4', stock.value !== $formData.stock_item_id && 'text-transparent')} />
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="quantity">
			<Control>
				{#snippet children({ props })}
					<Label>Quantity</Label>
					<Input {...props} bind:value={$formData.quantity} min="0" bind:max={remainingStock} type="number" placeholder="Quantity" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="remark">
			<Control>
				{#snippet children({ props })}
					<Label>Remark</Label>
					<Input {...props} bind:value={$formData.remark} type="text" placeholder="Remark" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="user_id" class="hidden">
			<Control>
				{#snippet children({ props })}
					<Label>User</Label>
					<Input {...props} bind:value={$formData.user_id} type="text" placeholder="Material Description" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Button class="mt-4" type="submit" disabled={$delayed ? true : false}>
			{#if $delayed}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Saving...
			{:else}
				Save
			{/if}
		</Button>
		{#if $message}
			<p class="text-destructive-foreground mt-2 bg-destructive p-2 text-center text-xs font-semibold">{$message}</p>
		{/if}
	</form>
</div>

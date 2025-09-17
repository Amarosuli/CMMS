<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { LoaderCircle, ChevronLeft, CalendarPlus, ChevronsUpDown, Check } from '@lucide/svelte';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { deserialize } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { useId } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers.js';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils.js';

	let { data } = $props();

	const { user, transactionType, stock } = data;

	const createStockMaster = async (data: Record<string, any>) => {
		let formData = new FormData();
		for (let key in data) {
			formData.append(key, data[key]);
		}

		const response = await fetch('?/updateToStockMaster', {
			method: 'POST',
			body: formData
		});

		return deserialize(await response.text());
	};

	const form = superForm(data.form, {
		onSubmit({ cancel }) {
			if (Math.sign(Number(remainingStock)) === -1) {
				toast.error('Stock out quantity is over than available quantity.');
				cancel();
			}
		},
		onUpdate({ form, result }) {
			if (form.valid) {
				toast.success(form.message.text);

				if (result.type === 'success') {
					let data = form.message.result;
					let redirectUrl = `/stock/${data.stock_id}`;

					createStockMaster({
						stock_id: data.stock_id,
						quantity: data.quantity
					})
						.then((res: Record<string, any>) => {
							toast.success(JSON.parse(res.data).message);
						})
						.catch((er) => {
							toast.error(er);
						})
						.finally(() => {
							goto(redirectUrl);
						});
				}

				goto('/stock');
			}
		}
	});
	const { form: formData, delayed, message, enhance } = form;

	let open = $state(false);
	let selectedStock = $derived(stock.find((f) => f.value === $formData.stock_id));
	let remainingStock: string = $state('');

	const triggerId = useId();

	$effect(() => {
		$formData.user_id = user ? user.id : '';
		$formData.transaction_type = transactionType.find(({ label }: { label: string }) => label == 'SOUT')?.label as string;
		remainingStock = selectedStock?.quantity_available.toString() || '';
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
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 forced-colors:outline">{$formData.transaction_type}</span>
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
	<h2 class="text-foreground text-base/7 font-semibold sm:text-sm/6">Stock Out Form Field</h2>
	<hr role="presentation" class="border-foreground/10 mt-4 w-full border-t" />
	<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" action="?/save" method="post" use:enhance>
		<Field {form} name="stock_id" class="flex flex-col">
			<Popover.Root bind:open>
				<Control id={triggerId}>
					{#snippet children({ props })}
						<Label>Stock {remainingStock ? `- Available Qty : ${(Number(remainingStock) - $formData.quantity).toString()} ${selectedStock?.unit || ''}` : ''}</Label>
						<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), ' justify-between overflow-hidden', !$formData.stock_id && 'text-muted-foreground')} role="combobox" {...props}>
							<p class="truncate">{stock.find((f) => f.value === $formData.stock_id)?.detail ?? 'Select Material'}</p>
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Popover.Trigger>
						<input hidden value={$formData.stock_id} name={props.name} />
					{/snippet}
				</Control>
				<Popover.Content class="p-0">
					<Command.Root>
						<Command.Input autofocus placeholder="Search Stock..." class="h-9" />
						<Command.Empty>No stock found.</Command.Empty>
						<Command.Group class="max-h-56 overflow-y-auto">
							{#each stock as stock}
								<Command.Item
									value={stock.detail}
									onSelect={() => {
										$formData.stock_id = stock.value;
										closeAndFocusTrigger(triggerId);
									}}>
									<div class="flex flex-col">
										<p class="block w-full text-xs">{stock.detail.split('-')[0]}</p>
										<p class="block w-full text-xs">{stock.detail.split('-')[1]}</p>
										<p class="block w-full text-xs capitalize">{stock.detail.split('-')[2].toLowerCase()}</p>
										<p class="text-primary block w-full text-xs">{stock.detail.split('-')[3]}</p>
									</div>
									<Check class={cn('ml-auto h-4 w-4', stock.value !== $formData.stock_id && 'text-transparent')} />
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="transaction_type" class="hidden">
			<Control>
				{#snippet children({ props })}
					<Label>Transaction Type</Label>
					<Input {...props} bind:value={$formData.transaction_type} type="text" placeholder="Status" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="quantity">
			<Control>
				{#snippet children({ props })}
					<Label>Quantity</Label>
					<Input {...props} bind:value={$formData.quantity} min="0" type="number" placeholder="Quantity" />
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
		<Field {form} name="refference_id">
			<Control>
				{#snippet children({ props })}
					<Label>Refference</Label>
					<Input {...props} bind:value={$formData.refference_id} type="text" placeholder="Refference" />
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
			<p class="bg-destructive text-destructive-foreground mt-2 p-2 text-center text-xs font-semibold">{$message}</p>
		{/if}
	</form>
</div>

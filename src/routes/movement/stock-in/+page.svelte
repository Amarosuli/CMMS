<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { LoaderCircle, ChevronLeft, CalendarPlus, CalendarIcon, ChevronsUpDown, Check } from '@lucide/svelte';
	import { DateFormatter, parseDate, getLocalTimeZone, type DateValue, today } from '@internationalized/date';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { deserialize } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers.js';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { useId } from 'bits-ui';

	let { data } = $props();

	const { user, transactionType, materialMaster } = data;

	const createStockMaster = async (data: Record<string, any>) => {
		let formData = new FormData();
		for (let key in data) {
			formData.append(key, data[key]);
		}

		const response = await fetch('?/saveToStockMaster', {
			method: 'POST',
			body: formData
		});

		return deserialize(await response.text());
	};

	const form = superForm(data.form, {
		onUpdate({ form, result }) {
			if (form.valid) {
				toast.success(form.message.text);

				if (result.type === 'success') {
					let data = form.message.result;

					createStockMaster({
						batch_number: data.batch_number,
						purchase_order: data.purchase_order,
						quantity_available: data.quantity,
						expired_date: data.expired_date,
						material_id: data.material_id,
						status: 'ACTIVE',
						stock_in_id: data.id
					})
						.then((res: Record<string, any>) => {
							toast.success(JSON.parse(res.data).message);
						})
						.catch((er) => {
							toast.error(er);
						})
						.finally(() => {
							goto('/stock');
						});
				}

				goto('/stock');
			}
		}
	});
	const { form: formData, delayed, message, enhance } = form;
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let open = $state(false);
	let triggerId = useId();
	let expiredAt = $derived($formData.expired_date ? parseDate($formData.expired_date) : undefined);
	let placeholder = $state<DateValue>(today(getLocalTimeZone()));

	$effect(() => {
		$formData.user_id = user ? user.id : '';
		$formData.transaction_type = transactionType.find(({ label }: { label: string }) => label == 'SIN')?.label as string;
	});

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<svelte:head>
	<title>CMMS - Stock In</title>
</svelte:head>

<div>
	<Button href="/stock" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Stock Available</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Create <span class="text-foreground/50">Stock In</span></h1>
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
	<h2 class="text-foreground text-base/7 font-semibold sm:text-sm/6">Stock In Form Field</h2>
	<hr role="presentation" class="border-foreground/10 mt-4 w-full border-t" />
	<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" action="?/save" method="post" use:enhance>
		<Field {form} name="material_id" class="flex flex-col">
			<Popover.Root bind:open>
				<Control id={triggerId}>
					{#snippet children({ props })}
						<Label>Material</Label>
						<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), ' justify-between overflow-hidden', !$formData.material_id && 'text-muted-foreground')} role="combobox" {...props}>
							<p class="truncate">{materialMaster.find((f) => f.value === $formData.material_id)?.detail ?? 'Select Material'}</p>
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Popover.Trigger>
						<input hidden value={$formData.material_id} name={props.name} />
					{/snippet}
				</Control>
				<Popover.Content class="p-0">
					<Command.Root>
						<Command.Input autofocus placeholder="Search Material..." class="h-9" />
						<Command.Empty>No material found.</Command.Empty>
						<Command.Group class="max-h-56 overflow-y-auto">
							{#each materialMaster as material}
								<Command.Item
									value={material.detail}
									onSelect={() => {
										$formData.material_id = material.value;
										closeAndFocusTrigger(triggerId);
									}}>
									<div class="flex flex-col">
										<p class="block w-full text-xs">{material.detail.split('-')[0]}</p>
										<p class="block w-full text-xs">{material.detail.split('-')[1]}</p>
										<p class="block w-full text-xs capitalize">{material.detail.split('-')[2]}</p>
									</div>
									<Check class={cn('ml-auto h-4 w-4', material.value !== $formData.material_id && 'text-transparent')} />
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="purchase_order">
			<Control>
				{#snippet children({ props })}
					<Label>Purchase Order</Label>
					<Input {...props} bind:value={$formData.purchase_order} type="text" placeholder="Purchase Order" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="batch_number">
			<Control>
				{#snippet children({ props })}
					<Label>Batch Number</Label>
					<Input {...props} bind:value={$formData.batch_number} type="text" placeholder="Batch Number" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="expired_date">
			<Control>
				{#snippet children({ props })}
					<Label>Expired at</Label>
					<Popover.Root>
						<Popover.Trigger {...props} class={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start text-left font-normal', !expiredAt && 'text-muted-foreground')}>
							<CalendarIcon class="mr-2 h-4 w-4" />
							{expiredAt ? df.format(expiredAt.toDate(getLocalTimeZone())) : 'Pick a date'}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<Calendar
								type="single"
								value={expiredAt as DateValue}
								bind:placeholder
								class="rounded-md border shadow-sm"
								captionLayout="dropdown"
								onValueChange={(v: number) => {
									if (v) {
										$formData.expired_date = v.toString();
									} else {
										$formData.expired_date = '';
									}
								}} />
						</Popover.Content>
					</Popover.Root>
					<input hidden value={$formData.expired_date} name={props.name} />
				{/snippet}
			</Control>
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
					<Input {...props} bind:value={$formData.quantity} type="number" placeholder="Quantity" />
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
			<p class="bg-destructive text-destructive-foreground mt-2 p-2 text-center text-xs font-semibold">{$message}</p>
		{/if}
	</form>
</div>

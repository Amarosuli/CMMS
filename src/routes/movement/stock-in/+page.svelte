<script lang="ts">
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';

	import { LoaderCircle, ChevronLeft, CalendarPlus, CalendarIcon, ChevronsUpDown, Check, Plus } from '@lucide/svelte';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { type DateValue, CalendarDate } from '@internationalized/date';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { deserialize } from '$app/forms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { toast } from 'svelte-sonner';
	import { useId } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers.js';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { StockMasterStatus } from '$lib/CostumTypes.js';

	let { data } = $props();

	const { user, packageNameOption, materialMasterOption } = data;

	const toDay = new Date().toISOString().split('T');
	const getDate = toDay[0].split('-');
	const maxValueDate: DateValue = new CalendarDate(parseInt(getDate[0]), parseInt(getDate[1]), parseInt(getDate[2])).add({ years: 300 });

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
					const data = form.message.result;
					const packageSize = data.isPackaged ? data.package_size : 1;
					const totalRow = Math.ceil(data.quantity / packageSize);

					let remainingItem = data.quantity;
					const promises = [];

					for (let i = 1; i <= totalRow; i++) {
						const quantityPerRow = remainingItem >= packageSize ? packageSize : remainingItem;

						const identity = `${data.batch_number}${i.toString().padStart(4, '0')}`;

						const request = createStockMaster({
							identity: identity,
							batch_number: data.batch_number,
							purchase_order: data.purchase_order,
							quantity: quantityPerRow,
							quantity_available: quantityPerRow,
							expired_date: data.expired_date,
							material_master_id: data.material_master_id,
							isBorrowed: false,
							isNew: true,
							status: StockMasterStatus.ACTIVE,
							stock_in_id: data.id
						});

						promises.push(request);
						remainingItem -= quantityPerRow;
					}

					Promise.all(promises)
						.then(() => {
							toast.success(`${totalRow} stock master records have been created successfully.`);
							goto('/stock');
						})
						.catch((er) => {
							toast.error(er);
						});
				}

				goto('/stock');
			}
		}
	});
	const { form: formData, errors, delayed, message, enhance } = form;

	let open = $state(false);
	let triggerId = useId();
	let expiredAt = $state<DateValue | undefined>();

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
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 forced-colors:outline"> SIN </span>
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
		<Field {form} name="material_master_id" class="flex flex-col">
			<Popover.Root bind:open>
				<Control id={triggerId}>
					{#snippet children({ props })}
						<Label>Material</Label>
						<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), ' justify-between overflow-hidden', !$formData.material_master_id && 'text-muted-foreground')} role="combobox" {...props}>
							<p class="truncate">{materialMasterOption.find((f) => f.value === $formData.material_master_id)?.detail ?? 'Select Material'}</p>
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Popover.Trigger>
						<input hidden value={$formData.material_master_id} name={props.name} />
					{/snippet}
				</Control>
				<Popover.Content class="p-0">
					<Command.Root>
						<Command.Input autofocus placeholder="Search Material..." class="h-9" />
						<Command.Empty>No material found.</Command.Empty>
						<Command.Group class="max-h-56 overflow-y-auto">
							{#each materialMasterOption as material}
								<Command.Item
									value={material.detail}
									onSelect={() => {
										$formData.material_master_id = material.value;
										closeAndFocusTrigger(triggerId);
									}}>
									<div class="flex flex-col">
										<p class="block w-full text-xs">{material.detail.split('-')[0]}</p>
										<p class="block w-full text-xs">{material.detail.split('-')[1]}</p>
										<p class="block w-full text-xs capitalize">{material.detail.split('-')[2].toLowerCase()}</p>
									</div>
									<Check class={cn('ml-auto h-4 w-4', material.value !== $formData.material_master_id && 'text-transparent')} />
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
							{expiredAt ? expiredAt : 'Pick a date'}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<Calendar
								type="single"
								value={expiredAt as DateValue}
								class="rounded-md border shadow-sm"
								captionLayout="dropdown"
								maxValue={maxValueDate}
								onValueChange={(v: DateValue | undefined) => {
									if (v) {
										let currentTime = new Date().toISOString().split('T')[1];
										expiredAt = v;
										$formData.expired_date = v.toString() + 'T' + currentTime;
									} else {
										expiredAt = v;
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
		<Field {form} name="quantity">
			<Control>
				{#snippet children({ props })}
					<Label>Quantity</Label>
					<Input {...props} bind:value={$formData.quantity} type="number" placeholder="Quantity" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="isPackaged">
			<Control>
				{#snippet children({ props })}
					<Label>Does it come packaged ?</Label>
					<div class="flex items-center gap-2">
						<Switch {...props} bind:checked={$formData.isPackaged} />
						{$formData.isPackaged ? 'Yes' : 'No'}
					</div>
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		{#if $formData.isPackaged}
			<Field {form} name="package_size">
				<Control>
					{#snippet children({ props })}
						<Label>Package Size (quantity in one package)</Label>
						<Input {...props} bind:value={$formData.package_size} type="text" placeholder="Package Size" />
					{/snippet}
				</Control>
				<FieldErrors class="text-xs italic" />
			</Field>
			<Field {form} name="package_name">
				<Control>
					{#snippet children({ props })}
						<Label>Package Name</Label>
						<Input {...props} bind:value={$formData.package_name} type="text" hidden placeholder="Package Name" />
						<ToggleGroup.Root variant="outline" type="single" bind:value={$formData.package_name}>
							{#each packageNameOption as packageName}
								<ToggleGroup.Item value={packageName.label} aria-label="Toggle bold">
									<p class="px-1">{packageName.label}</p>
								</ToggleGroup.Item>
							{/each}
							<Button variant="ghost" class="rounded-l-none"><Plus class="size-4" /></Button>
						</ToggleGroup.Root>
					{/snippet}
				</Control>
				<FieldErrors class="text-xs italic" />
			</Field>
		{/if}
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
		{#if $errors['_errors']}
			<p class="bg-destructive text-destructive-foreground mt-2 p-2 text-center text-xs font-semibold">{$errors._errors[0]}</p>
		{/if}
		{#if $message}
			<p class="bg-destructive text-destructive-foreground mt-2 p-2 text-center text-xs font-semibold">{$message}</p>
		{/if}
	</form>
</div>

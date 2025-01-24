<script lang="ts">
	import { FieldErrors, Control, Field, Label, Legend, ElementField } from '$lib/components/ui/form';
	import { LoaderCircle, ScanQrCode, ArrowDown, CalendarPlus, Plus, X } from 'lucide-svelte';
	import { BorrowItemInput, ConfirmDialog } from '$lib/components/costum';
	import { goto, onNavigate } from '$app/navigation';
	import { BorrowStatus } from '$lib/CostumTypes.js';
	import { QRScanner } from '$lib/components/costum';
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { time } from '$lib/helpers';
	import { pb } from '$lib/pocketbaseClient.js';

	let { data } = $props();
	const { user } = data;
	let borrowingConfirmDialog: boolean = $state(false);
	let itemConfirmDialog: boolean = $state(false);

	let borrowingId = $state('');

	const FBorrowing = superForm(data.formBorrowing, {
		resetForm: false,
		invalidateAll: false,
		onUpdate({ form, result }) {
			if (form.valid) {
				toast.success(form.message.text);

				if (result.type === 'success') {
					let data = form.message.result;
					borrowCreated = true;

					borrowingId = data.id;
					$FormItem.items.forEach((item) => (item.borrow_id = borrowingId));
				}
			}
		}
	});
	const { form: FormBorrowing, delayed: DelayedBorrowing, message: MessageBorrowing, enhance: EnhanceBorrowing, submit: submitBorrowing } = FBorrowing;

	const FItem = superForm(data.formItem, {
		dataType: 'json',
		onUpdate({ form, result }) {
			if (form.valid) {
				itemSaved = true;
				toast.success(form.message.text);
				return goto('/');
			} else {
				return toast.error('Input not valid, crosscheck value!');
			}
		}
	});
	const { form: FormItem, delayed: DelayedItem, message: MessageItem, enhance: EnhanceItem, submit: submitItem } = FItem;

	$effect(() => {
		$FormBorrowing.user_id = user?.id;
		$FormBorrowing.status = BorrowStatus.OPEN;
		$FormItem.items.forEach((item) => (item.borrow_id = borrowingId));
	});
	// let $FormBorrowing.user_id = $derived(user?.id);
	// let $FormBorrowing.status = $derived(BorrowStatus.OPEN);
	let stockSkip = $derived.by(() =>
		$FormItem.items.map((item) => {
			return { id: item.stock_id };
		})
	);

	function removeItemByIndex(index: number) {
		$FormItem.items = $FormItem.items.filter((_, i) => i !== index);
	}

	function addItem(stock_id?: string) {
		let bucket = {
			borrow_id: borrowingId,
			stock_id: '',
			quantity_out: 1,
			date_out: new Date().toUTCString()
		};

		if (stock_id) {
			bucket.stock_id = stock_id;
			$FormItem.items = [...$FormItem.items, bucket];
			scanning = false;
		} else {
			$FormItem.items = [...$FormItem.items, bucket];
		}
	}

	function setItemQtyOut(e: Event & { target: HTMLInputElement }, index: number) {
		const target = e.target as HTMLInputElement;
		$FormItem.items[index].quantity_out = parseInt(target.value);
	}

	function findEqualThenAddQuantity(stock_id: string) {
		let res = $FormItem.items.find((item) => item.stock_id === stock_id);
		if (res) {
			let bucket = $FormItem.items.map((item) => {
				if (item.stock_id !== stock_id) return item;
				return { ...item, quantity_out: item.quantity_out + 1 };
			});
			$FormItem.items = bucket;
			scanning = false;

			return true;
		}
		return false;
	}

	function handleCaptured(e: CustomEvent<{ data: { stock_id: string; material_id: string } }>) {
		const data = e.detail.data;
		if (!$FormItem.items[0].stock_id) {
			$FormItem.items[0].stock_id = data.stock_id;
			return;
		} else {
			const result = findEqualThenAddQuantity(data.stock_id);
			if (result) return;
		}
		addItem(data.stock_id);
	}

	let scanning: boolean = $state(false);
	let itemSaved: boolean = false;
	let borrowCreated: boolean = false;

	onNavigate(() => {
		// if borrowing created but no items insert, remove borrowing
		if (borrowCreated && !itemSaved) {
			return new Promise((resolve) => {
				resolve(
					pb
						.collection('borrow_movement')
						.delete(borrowingId)
						.then(() => {
							toast.success('Remove unsave borrowing data');
						})
						.catch((error) => {
							toast.error('Error while remove unsave borrowing data', error.message);
						})
				);
			});
		}
	});
</script>

<QRScanner bind:scanning on:captured={handleCaptured} />
<ConfirmDialog title="Confirm the data is correct!" bind:open={borrowingConfirmDialog} onConfirm={submitBorrowing} />
<ConfirmDialog bind:open={itemConfirmDialog} onConfirm={submitItem} />

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Create <span class="text-foreground/50">Borrow Material</span></h1>
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
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Complete Data Below</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" action="?/createBorrowing" method="post" use:EnhanceBorrowing>
		<Field form={FBorrowing} name="order_number">
			<Control>
				{#snippet children({ props })}
					<Label>Order Number</Label>
					<Input {...props} bind:value={$FormBorrowing.order_number} type="text" placeholder="Order Number" disabled={borrowingId ? true : false} />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field form={FBorrowing} name="esn">
			<Control>
				{#snippet children({ props })}
					<Label>ESN</Label>
					<Input {...props} bind:value={$FormBorrowing.esn} type="text" placeholder="ESN" disabled={borrowingId ? true : false} />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field form={FBorrowing} name="status" class="hidden">
			<Control>
				{#snippet children({ props })}
					<Label>Status</Label>
					<Input {...props} bind:value={$FormBorrowing.status} type="text" placeholder="Status" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field form={FBorrowing} name="user_id" class="hidden">
			<Control>
				{#snippet children({ props })}
					<Label>User</Label>
					<Input {...props} bind:value={$FormBorrowing.user_id} type="text" placeholder="User Id" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Button class="mt-4 {borrowingId ? 'hidden' : ''}" onclick={() => (borrowingConfirmDialog = !borrowingConfirmDialog)} disabled={$DelayedBorrowing ? true : false}>
			{#if $DelayedBorrowing}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Creating...
			{:else}
				Create
			{/if}
		</Button>
	</form>
	{#if $MessageBorrowing}
		<div class="mt-6 flex w-full flex-col items-center justify-center bg-yellow-300">
			<p class="p-2 text-center text-xs font-semibold text-background">{$MessageBorrowing.text} Now add material either manualy or by QR Code Scanner!</p>
		</div>
		<div class="items-cemter mt-4 flex w-full justify-center">
			<ArrowDown class="h-6 w-6 animate-bounce" />
		</div>
	{/if}
</div>

{#if borrowingId}
	<div class="mt-6">
		<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Borrowing Items</h2>
		<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
		<form class="mt-3 flex w-full flex-col text-base/6 sm:text-sm/6" action="?/addItemBorrowing" method="post" use:EnhanceItem>
			<Field form={FItem} name="items">
				<Legend>Items</Legend>
				<div class="flex w-full flex-row items-center gap-2"></div>
				{#each $FormItem.items as _, i}
					<div class="flex w-full flex-row gap-2">
						<BorrowItemInput {FItem} {FormItem} {stockSkip} index={i} />
						<Field form={FItem} name="items[{i}].quantity_out" class="flex-grow-0">
							<Control>
								{#snippet children({ props })}
									<Label>Quantity</Label>
									<Input {...props} value={$FormItem.items[i].quantity_out} onchange={(e: Event & { target: HTMLInputElement }) => setItemQtyOut(e, i)} min="0" type="number" placeholder="Quantity Out" />
								{/snippet}
							</Control>
							<FieldErrors class="text-xs italic" />
						</Field>
						<ElementField form={FItem} name="items[{i}].borrow_id" class="hidden">
							<Control>
								{#snippet children({ props })}
									<Label>Borrow Id</Label>
									<Input {...props} bind:value={$FormItem.items[i].borrow_id} type="text" placeholder="Borrow Id" />
								{/snippet}
							</Control>
							<FieldErrors class="text-xs italic" />
						</ElementField>
						{#if i != 0}
							<Button variant="outline" class="mt-8" onclick={() => removeItemByIndex(i)}><X class="h-4 w-4" /></Button>
						{/if}
					</div>
				{/each}
				<div class="gap-auto z-20 mt-4 flex w-full items-center justify-start gap-2">
					<Button
						variant="outline"
						class="w-full min-w-32 max-w-40 sm:w-fit"
						onclick={() => {
							addItem();
						}}><Plus class="mr-2 h-4 w-4 " />Add Item</Button>
					<Button
						disabled={!borrowingId}
						variant="outline"
						class="w-full min-w-32 max-w-40 sm:w-fit md:mx-0"
						onclick={() => {
							scanning = !scanning;
						}}>
						<ScanQrCode class="mr-2 h-4 w-4" />
						Scan QR</Button>
				</div>
			</Field>
			<Button class="mt-4 max-w-80" onclick={() => (itemConfirmDialog = !itemConfirmDialog)} disabled={$DelayedItem ? true : false}>
				{#if $DelayedItem}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Saving...
				{:else}
					Save
				{/if}
			</Button>
			{#if $MessageItem}
				<p class="mt-2 bg-destructive p-2 text-center text-xs font-semibold text-destructive-foreground">{$MessageItem}</p>
			{/if}
		</form>
	</div>
{/if}

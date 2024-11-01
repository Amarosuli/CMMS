<script lang="ts">
	import { FieldErrors, Control, Field, Label, Legend, ElementField } from '$lib/components/ui/form';
	import { LoaderCircle, ScanQrCode, ArrowDown, CalendarPlus, Plus, X } from 'lucide-svelte';
	import { goto, onNavigate } from '$app/navigation';
	import { BorrowItemInput } from '$lib/components/costum';
	import { BorrowStatus } from '$lib/CostumTypes.js';
	import { QRScanner } from '$lib/components/costum';
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { time } from '$lib/helpers';
	import { pb } from '$lib/pocketbaseClient.js';

	export let data;
	const { user } = data;

	$: borrowingId = '';

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
	const { form: FormBorrowing, delayed: DelayedBorrowing, message: MessageBorrowing, enhance: EnhanceBorrowing } = FBorrowing;

	$: $FormBorrowing.user_id = user?.id;
	$: $FormBorrowing.status = BorrowStatus.OPEN;
	$: stockSkip = $FormItem.items.map((item) => {
		return { id: item.stock_id };
	});

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
	const { form: FormItem, delayed: DelayedItem, message: MessageItem, enhance: EnhanceItem } = FItem;

	$: $FormItem.items.forEach((item) => (item.borrow_id = borrowingId));

	function removeItemByIndex(index: number) {
		$FormItem.items = $FormItem.items.filter((_, i) => i !== index);
	}

	function addItem(stock_id?: string) {
		if (stock_id) {
			// check dulu di items, apakah udah ada stock_id sama, jika ada hanya tambahkan quantity saja.
			let res = $FormItem.items.find((item) => item.stock_id === stock_id);
			if (res) {
				let bucket = $FormItem.items.map((item) => {
					if (item.stock_id !== stock_id) return item;
					return { ...item, quantity_out: item.quantity_out + 1 };
				});
				$FormItem.items = bucket;
				return;
			}
		}
		let bucket = [
			...$FormItem.items,
			{
				borrow_id: '',
				stock_id: '',
				quantity_out: 1,
				date_out: new Date().toUTCString()
			}
		];
		$FormItem.items = bucket;
	}

	function setItemQtyOut(e: Event, index: number) {
		const target = e.target as HTMLInputElement;
		$FormItem.items[index].quantity_out = parseInt(target.value);
	}

	function handleCaptured(e: CustomEvent<{ data: { stock_id: string; material_id: string } }>) {
		const data = e.detail.data;
		if ($FormItem.items.length === 1) {
			if (!$FormItem.items[0].stock_id) {
				$FormItem.items[0].stock_id = data.stock_id;
			}
		} else {
			addItem(data.stock_id);
		}
	}

	let scanning: boolean = false;
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
			<Control let:attrs>
				<Label>Order Number</Label>
				<Input {...attrs} bind:value={$FormBorrowing.order_number} type="text" placeholder="Order Number" disabled={borrowingId} />
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field form={FBorrowing} name="esn">
			<Control let:attrs>
				<Label>ESN</Label>
				<Input {...attrs} bind:value={$FormBorrowing.esn} type="text" placeholder="ESN" disabled={borrowingId} />
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field form={FBorrowing} name="status" class="hidden">
			<Control let:attrs>
				<Label>Status</Label>
				<Input {...attrs} bind:value={$FormBorrowing.status} type="text" placeholder="Status" />
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field form={FBorrowing} name="user_id" class="hidden">
			<Control let:attrs>
				<Label>User</Label>
				<Input {...attrs} bind:value={$FormBorrowing.user_id} type="text" placeholder="User Id" />
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Button class="mt-4 {borrowingId ? 'hidden' : ''}" type="submit" disabled={$DelayedBorrowing ? true : false}>
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
							<Control let:attrs>
								<Label>Quantity Out</Label>
								<Input {...attrs} value={$FormItem.items[i].quantity_out} on:change={(e) => setItemQtyOut(e, i)} min="0" type="number" placeholder="Quantity Out" />
							</Control>
							<FieldErrors class="text-xs italic" />
						</Field>
						<ElementField form={FItem} name="items[{i}].borrow_id" class="hidden">
							<Control let:attrs>
								<Label>Borrow Id</Label>
								<Input {...attrs} bind:value={$FormItem.items[i].borrow_id} type="text" placeholder="Borrow Id" />
							</Control>
							<FieldErrors class="text-xs italic" />
						</ElementField>
						{#if i != 0}
							<Button variant="outline" class="mt-8" on:click={() => removeItemByIndex(i)}><X class="h-4 w-4" /></Button>
						{/if}
					</div>
				{/each}
				<div class="gap-auto z-20 mt-4 flex w-full items-center justify-start gap-2">
					<Button variant="outline" class="w-full min-w-32 max-w-40 sm:w-fit" on:click={addItem}><Plus class="mr-2 h-4 w-4 " />Add Item</Button>
					<Button disabled={!borrowingId} variant="outline" class="w-full min-w-32 max-w-40 sm:w-fit md:mx-0" on:click={() => (scanning = !scanning)}>
						<ScanQrCode class="mr-2 h-4 w-4" />
						Scan QR</Button>
				</div>
			</Field>
			<Button class="mt-4 max-w-80" type="submit" disabled={$DelayedItem ? true : false}>
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

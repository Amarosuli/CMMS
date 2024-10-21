<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import { CalendarPlus, ChevronLeft, Eye, Pencil } from 'lucide-svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers.js';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbaseClient';

	import type { RecordModel } from 'pocketbase';

	export let data;

	const { openBorrowing } = data;

	let borrowedItems: RecordModel[] = [];
	let open: boolean = false;

	async function getBorrowedItems(borrowId: string) {
		let result = await pb.collection('borrow_item').getFullList({ filter: 'borrow_id="' + borrowId + '"', expand: 'stock_id.material_id.unit_id' });
		borrowedItems = result.map((item) => {
			return { ...item, stock: item.expand?.stock_id, material: item.expand?.stock_id.expand.material_id, unit: item.expand?.stock_id.expand?.material_id.expand?.unit_id.code };
		});
	}

	async function drawerOpenHandler(borrowId: string) {
		getBorrowedItems(borrowId);
		open = !open;
	}
</script>

<Drawer.Root bind:open>
	<!-- <Drawer.Trigger>Open</Drawer.Trigger> -->
	<Drawer.Content class="flex w-full  sm:justify-start lg:justify-center">
		<Drawer.Header>
			<Drawer.Title>Borrowed Items</Drawer.Title>
			<Drawer.Description>Please do crosscheck for each item return.</Drawer.Description>
		</Drawer.Header>
		<div class="h-ful w-full p-4 pb-6">
			<ScrollArea class="h-96 max-h-96">
				<div class="flex w-full flex-col gap-2">
					{#each borrowedItems as item}
						<div class="flex w-full flex-col border-t p-2 pt-4 text-xs md:flex-row md:items-center md:gap-3 lg:w-full">
							<p class="w-full flex-1">Mat. Code : {item.material.code}</p>
							<p class="w-full flex-1 truncate">Mat. Description : {item.material.description}</p>
							<p class="w-full flex-1 max-sm:hidden">Batch : {item.stock.batch_number}</p>
							<p class="w-full flex-1">Purchase Order : {item.stock.purchase_order}</p>
							<p class="w-full max-w-32 truncate">Out Quantity : {item.quantity_out} {item.unit || 'EA'}</p>
							<p class="mb-3 w-full max-w-32 truncate md:mb-0">Return Quantity : {item.quantity_return}</p>
							<Button size="default" variant="outline" class="mr-auto">Save</Button>
						</div>
					{/each}
				</div>
			</ScrollArea>
		</div>
		<Drawer.Footer class="flex w-full items-center justify-center space-y-2">
			<Button size="default" class="w-80 bg-lime-500 text-background">Close Transaction</Button>
			<Drawer.Close>Cancel</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>

<div>
	<Button href="/" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Dashboard</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Active <span class="text-foreground/50">Borrowing</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline"></span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
	</div>
</div>

<div class="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
	{#if openBorrowing.length === 0}
		<p class="inline-flex w-fit items-center rounded-md bg-lime-400/20 p-2 text-sm/5 font-bold text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">Currently no active borrowing</p>
	{/if}
	{#each openBorrowing as borrow}
		<div class="relative">
			<div class="absolute bottom-8 right-0 flex gap-2">
				<Button variant="outline" on:click={() => goto('/active-borrowing/' + borrow.id)}>
					<Pencil class="mr-2 h-4 w-4" />
					Edit
				</Button>
				<Button variant="outline" on:click={() => drawerOpenHandler(borrow.id)}>
					<Eye class="mr-2 h-4 w-4" />
					Detail
				</Button>
			</div>
			<hr role="presentation" class="w-full border-t" />
			<div class="mt-6 font-mono text-sm/3 font-light text-lime-500 sm:text-xs/3">{time(borrow.created, { format: 'ddd, DD MMM YYYY - h:mm A' })}</div>
			<div class=" text-lg font-medium sm:text-sm/6">{borrow.user.username} - {borrow.user.name}</div>
			<div class="mt-3 text-2xl/8 font-extrabold text-foreground/80 sm:text-xl/8">{borrow.status}</div>
			<div class="mt-3 text-sm/6 sm:text-xs/6">
				<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{borrow.esn || 'No ESN'}</span> <span class="text-zinc-500">{borrow.order_number || 'No Order Number'}</span>
			</div>
		</div>
	{/each}
</div>

<div class="flex flex-col gap-3">
	<p class="mt-20">admin bisa menghapus item maupun transaksi itu sendiri, menghapus transaksi akan menghapus item data peminjaman item secara otomatis.</p>
	<p>admin bisa edit manual item peminjaman (menambah item, mengurangi item, mengubah qty out) atau data peminjaman itu sendiri (order number , esn).</p>
	<p>(ui yg lain)produksi juga bisa mengedit data peminjaman dan item yang mereka pinjam</p>
	<p>ketika produksi return borrowing, status akan jadi pending.</p>
	<p>admin bisa cross check actual material yang kembali.</p>
	<p>admin bisa closing transaction, closing transaction akan memproses : check qty return lebih kecil dari qty out. jika yes, sistem akan create stock out dengan referensi id transaksi. kemudian, akan merubah status borrowing movement menjadi closed</p>
	<p>transaksi yang sudah selesai, tidak akan muncul di halaman active borrowing.</p>
	<p>untuk selanjutnya, mungkin perlu menampilkan foto dari masing2 requester</p>
</div>

<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { type DropdownMenuTriggerProps } from 'bits-ui';
	import { ChevronDown, Plus, CircleDot } from '@lucide/svelte';
	// import { RecentTransaction } from '$lib/components/page';
	import { time, timeOfDay } from '$lib/helpers';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { pb } from '$lib/pocketbaseClient';
	import NumberFlow from '@number-flow/svelte';

	let { data } = $props();
	const { user } = $derived(data);

	const ranges = [
		{ value: '', label: 'Weekly', isChecked: true },
		{ value: '', label: 'Mothly', isChecked: false },
		{ value: '', label: 'Yearly', isChecked: false }
	];

	let checkedRange = $state('Weekly');

	const dashboard = () => {
		let totalBorrowed = $state(0);
		let totalUsedStock = $state(0);
		let totalWastedStock = $state(0);
		let totalStockUnderMinimum = $state(0);
		let activeBorrowing = $state(0);
		let materialMaintain = $state(0);
		let frequentlyUsed = $state(0);
		let frequentlyBorrowed = $state(0);
		async function getTotalBorrowed() {
			totalBorrowed = (await pb.collection('borrow_movement').getFullList({ sort: '-created' })).length;
		}

		async function getUsedStock() {
			totalUsedStock = (await pb.collection('total_stock_used').getOne('1')).total;
		}

		async function getWastedStock() {
			totalWastedStock = (await pb.collection('stock_out').getFullList({ filter: 'refference_id = ""' })).length;
		}

		async function getStockUnderMinimum() {
			totalStockUnderMinimum = (await pb.collection('total_stock_under_minimum').getFullList()).length;
		}

		async function getActiveBorrowing() {
			activeBorrowing = (await pb.collection('borrow_movement').getFullList({ sort: '-created', filter: 'status="OPEN"' })).length;
		}

		async function getMaterialMaintain() {
			materialMaintain = (await pb.collection('total_material_maintained').getOne('1')).total;
		}

		async function getFrequentlyUsed() {
			let frequentlyUsedItems = await pb.collection('frequently_used').getList(1, 5, { sort: 'total_count', expand: 'stock_id.material_master_id' });

			frequentlyUsed = frequentlyUsedItems.items.length;
		}

		async function getFrequentlyBorrowed() {
			let frequentlyBorrowedItems = await pb.collection('frequently_borrowed').getList(1, 5, { sort: 'total_count', expand: 'stock_id.material_master_id' });
			frequentlyBorrowed = frequentlyBorrowedItems.items.length;
		}

		let overviewItems = [
			{
				title: 'Stock Under Minimum',
				value: () => totalStockUnderMinimum,
				unit: 'Varian',
				sub: {
					value: '-1K',
					description: 'go to detail'
				}
			},

			{
				title: 'Total Wasted',
				value: () => totalWastedStock,
				unit: 'EA',
				sub: {
					value: '-3',
					description: 'from last week'
				}
			},
			{
				title: 'Total Used',
				value: () => totalUsedStock,
				unit: 'EA',
				sub: {
					value: '-1K',
					description: 'from last week'
				}
			},
			{
				title: 'Total Borrow',
				value: () => totalBorrowed,
				unit: 'EA',
				sub: {
					value: '+300',
					description: 'go to detail'
				}
			},
			{
				title: 'Active Borrowing',
				value: () => activeBorrowing,
				unit: 'Transaction',
				sub: {
					value: '-1K',
					description: 'from currnet shift'
				}
			},
			{
				title: 'Material Maintain',
				value: () => materialMaintain,
				unit: 'Type',
				sub: {
					value: '+300',
					description: 'go to detail'
				}
			},
			{
				title: 'Frequently Used',
				value: () => frequentlyUsed,
				unit: 'Type',
				sub: {
					value: '+300',
					description: 'go to detail'
				}
			},
			{
				title: 'Frequently Borrowed',
				value: () => frequentlyBorrowed,
				unit: 'Type',
				sub: {
					value: '+300',
					description: 'go to detail'
				}
			}
		];

		return {
			get totalBorrowed() {
				return totalBorrowed;
			},

			getTotalBorrowed,
			getUsedStock,
			getWastedStock,
			getStockUnderMinimum,
			getActiveBorrowing,
			getMaterialMaintain,
			getFrequentlyUsed,
			getFrequentlyBorrowed,
			overviewItems
		};
	};

	let dashboardData = dashboard();

	onMount(async () => {
		dashboardData.getTotalBorrowed();
		dashboardData.getUsedStock();
		dashboardData.getWastedStock();
		dashboardData.getStockUnderMinimum();
		dashboardData.getActiveBorrowing();
		dashboardData.getMaterialMaintain();
		dashboardData.getFrequentlyUsed();
		dashboardData.getFrequentlyBorrowed();
	});
</script>

<svelte:head>
	<title>CMMS - Dashboard</title>
</svelte:head>

<h1 class="text-2xl/8 font-semibold">Good {timeOfDay()}{user ? ', ' + user.name : ''}</h1>

{#if user && user.role === 'General'}
	<div class="mt-8 flex items-end justify-between">
		<h2 class="text-base/7 font-semibold">Your Summary</h2>
	</div>
	<div class="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
		<div>
			<hr role="presentation" class="w-full border-t" />
			<div class="mt-6 text-lg font-medium sm:text-sm/6">Total Borrow</div>
			<div class="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{dashboardData.totalBorrowed}</div>
			<div class="mt-3 text-sm/6 sm:text-xs/6">
				<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-hover:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-hover:bg-lime-400/15 forced-colors:outline">Count since</span> <span class="text-zinc-500">{time(new Date())}</span>
			</div>
		</div>
	</div>
	<div class="mt-8 flex items-end justify-between">
		<h2 class="text-base/7 font-semibold">Choose Action</h2>
	</div>
	<div class="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
		<div>
			<hr role="presentation" class="w-full border-t" />
			{#if true}
				<div class="mt-3 text-sm/6 sm:text-xs/6">
					<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-hover:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-hover:bg-lime-400/15 forced-colors:outline">You have 1</span> <span class="text-zinc-500">active borrowing !</span>
				</div>
			{/if}
			<div class="mt-6 flex gap-4 text-lg font-medium sm:text-sm/6">
				<Button href="/borrow" variant="outline" class="flex h-full flex-1 flex-col items-center p-4 text-lg font-semibold">
					<Plus class="h-6 w-6" />
					Borrow</Button>
				<Button href="/return" variant="outline" class="flex h-full flex-1 flex-col items-center p-4 text-lg font-semibold">
					<CircleDot class="h-6 w-6" />
					Return</Button>
			</div>
		</div>
	</div>
{:else}
	<div class="mt-8 flex items-end justify-between">
		<h2 class="text-base/7 font-semibold">Overview</h2>
		<div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props }: { props: DropdownMenuTriggerProps })}
						<Button {...props} variant="outline" class="ml-auto">
							{checkedRange}
							<ChevronDown class="ml-2 h-4 w-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.RadioGroup bind:value={checkedRange}>
						{#each ranges as range}
							<DropdownMenu.RadioItem value={range.label}>{range.label}</DropdownMenu.RadioItem>
						{/each}
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
	<div class="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
		{#each dashboardData.overviewItems as item}
			<div>
				<hr role="presentation" class="w-full border-t" />
				<div class="mt-6 text-lg font-medium sm:text-sm/6">{item.title}</div>
				<div class="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">
					<NumberFlow value={item.value()} />
					<span class="text-sm text-foreground/80">
						{item.unit}
					</span>
				</div>
				<!-- @TODO: add details button -->
				<!-- <div class="mt-3 text-sm/6 sm:text-xs/6">
					<span
						class="inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline {item.value() == 0
							? 'bg-lime-400/20 text-red-700 group-data-[hover]:bg-red-400/30 dark:bg-red-400/10 dark:text-red-300 dark:group-data-[hover]:bg-red-400/15'
							: 'bg-lime-400/20 text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15'}">{item.sub.value}</span> <span class="text-zinc-500">{item.sub.description}</span>
				</div> -->
			</div>
		{/each}
	</div>

	<div class="mt-8 flex items-end justify-between">
		<h2 class="text-base/7 font-semibold">Recent Transaction</h2>
	</div>
	<div class="mt-4">
		<div>
			<hr role="presentation" class="mb-4 w-full border-t" />

			<!-- <RecentTransaction /> -->
		</div>
	</div>
{/if}

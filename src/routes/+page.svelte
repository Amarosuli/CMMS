<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { ChevronDown, Plus, CircleDot } from 'lucide-svelte';
	import { RecentTransaction } from '$lib/components/page';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers';

	export let data;
	const { user } = data;

	const ranges = [
		{ value: '', label: 'Weekly', isChecked: true },
		{ value: '', label: 'Mothly', isChecked: false },
		{ value: '', label: 'Yearly', isChecked: false }
	];

	let checkedRange = 'Weekly';

	const overviewItems = [
		{
			title: 'Total Transaction',
			value: '37K',
			sub: {
				value: '+300',
				description: 'from last week'
			}
		},
		{
			title: 'Total Wasted',
			value: '50',
			sub: {
				value: '-3',
				description: 'from last week'
			}
		},
		{
			title: 'Total Used',
			value: '35K',
			sub: {
				value: '-1K',
				description: 'from last week'
			}
		},
		{
			title: 'Stock Under Minimum',
			value: '4 Material',
			sub: {
				value: '-1K',
				description: 'from last week'
			}
		},
		{
			title: 'Active Borrowing',
			value: '8 Transaction',
			sub: {
				value: '-1K',
				description: 'from currnet shift'
			}
		}
	];
</script>

<svelte:head>
	<title>CMMS - Dashboard</title>
</svelte:head>

<h1 class="text-2xl/8 font-semibold">Good Afternoon{user ? ', ' + user.name : ''}</h1>

{#if user && user.role === 'General'}
	<div class="mt-8 flex items-end justify-between">
		<h2 class="text-base/7 font-semibold">Your Summary</h2>
	</div>
	<div class="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
		<div>
			<hr role="presentation" class="w-full border-t" />
			<div class="mt-6 text-lg font-medium sm:text-sm/6">Total Borrow</div>
			<div class="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">50 Transaction</div>
			<div class="mt-3 text-sm/6 sm:text-xs/6">
				<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">Count since</span> <span class="text-zinc-500">{time(new Date())}</span>
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
					<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">You have 1</span> <span class="text-zinc-500">active borrowing !</span>
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
				<DropdownMenu.Trigger asChild let:builder>
					<Button variant="outline" class="ml-auto" builders={[builder]}>
						{checkedRange}
						<ChevronDown class="ml-2 h-4 w-4" />
					</Button>
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
		{#each overviewItems as item}
			<div>
				<hr role="presentation" class="w-full border-t" />
				<div class="mt-6 text-lg font-medium sm:text-sm/6">{item.title}</div>
				<div class="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{item.value}</div>
				<div class="mt-3 text-sm/6 sm:text-xs/6">
					<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{item.sub.value}</span> <span class="text-zinc-500">{item.sub.description}</span>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-8 flex items-end justify-between">
		<h2 class="text-base/7 font-semibold">Recent Transaction</h2>
	</div>
	<div class="mt-4">
		<div>
			<hr role="presentation" class="mb-4 w-full border-t" />

			<RecentTransaction />
		</div>
	</div>
{/if}

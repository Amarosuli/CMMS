<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { ChevronDown } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

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
<h2 class="mt-14 text-base/7 font-semibold text-zinc-950 dark:text-white sm:text-sm/6">Recent Transactions</h2>
<div class="flow-root">table here</div>

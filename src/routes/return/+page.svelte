<script lang="ts">
	import { CalendarPlus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers';

	let { data } = $props();
</script>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Return <span class="text-foreground/50"> Material</span></h1>
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
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Select Your Active Borrowing</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
</div>

<div class="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
	{#if data.activeBorrow.length === 0}
		<p class="inline-flex w-fit items-center rounded-md bg-lime-400/20 p-2 text-sm/5 font-bold text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">Currently no active borrowing</p>
	{/if}
	{#each data.activeBorrow as item}
		<div class="relative flex h-full flex-col items-start justify-start overflow-hidden rounded-xl border">
			<Button href="/return/{item.id}" variant="ghost" class="flex w-full flex-1 flex-col items-start justify-start rounded-none">
				<div class="md:text-md mt-2 text-sm/6 font-medium">ESN - {item.esn}</div>
				<div class="md:text-md text-sm/6 font-medium">Order Number - {item.order_number}</div>
				<div class="my-3 text-sm/6 sm:text-xs/6">
					<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{item.status}</span>
				</div>
			</Button>
			<Button onclick={() => goto(`/active-borrowing/${item.id}?fromUrl=/return`)} variant="outline" class="absolute right-2 top-2 ">Edit</Button>
		</div>
	{/each}
</div>

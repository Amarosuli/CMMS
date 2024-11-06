<script lang="ts">
	import { LoaderCircle, ScanQrCode, ArrowDown, CalendarPlus, Plus, X } from 'lucide-svelte';
	import { time } from '$lib/helpers';
	import { Button } from '$lib/components/ui/button';

	export let data;
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
	{#each data.activeBorrow as item}
		<Button href="/return/{item.id}" variant="secondary" class="flex h-full flex-col items-start justify-start border p-4">
			<div class="mt-2 text-lg font-medium sm:text-sm/6">ESN - {item.esn}</div>
			<div class="text-lg font-medium sm:text-sm/6">Order Number - {item.order_number}</div>
			<div class="mt-3 text-sm/6 sm:text-xs/6">
				<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{item.status}</span>
			</div>
		</Button>
	{/each}
</div>

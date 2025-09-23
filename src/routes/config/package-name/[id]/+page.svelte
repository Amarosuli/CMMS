<script lang="ts">
	import { ChevronLeft, CalendarPlus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers.js';
	import { page } from '$app/state';

	let { data } = $props();

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');

	const { data: packageName } = data.unit;
</script>

<svelte:head>
	<title>CMMS - Detail Package Name</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Package Name</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Detail <span class="text-foreground/50">Package Name</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
		<div class="flex gap-4">
			<Button variant="outline" onclick={() => goto(page.url.pathname + '/edit')} class="min-w-20 ">Edit</Button>
		</div>
	</div>
</div>

{#if packageName}
	<div class="mt-12">
		<h2 class="text-foreground text-base/7 font-semibold sm:text-sm/6">Detail of Package Name</h2>
		<hr role="presentation" class="border-foreground/10 mt-4 w-full border-t" />
		<dl class="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6">
			<dt class="border-foreground/5 text-foreground/50 col-start-1 border-t pt-3 first:border-none sm:py-3">Code</dt>
			<dd class="text-foreground sm:border-foreground/5 pt-1 pb-3 sm:border-t sm:py-3 sm:[&:nth-child(2)]:border-none">{packageName.name.toUpperCase()}</dd>
			<dt class="border-foreground/5 text-foreground/50 col-start-1 border-t pt-3 first:border-none sm:py-3">Description</dt>
			<dd class="text-foreground sm:border-foreground/5 pt-1 pb-3 capitalize sm:border-t sm:py-3 sm:[&:nth-child(2)]:border-none">{packageName.description?.toLowerCase() || '-'}</dd>
		</dl>
	</div>
{/if}

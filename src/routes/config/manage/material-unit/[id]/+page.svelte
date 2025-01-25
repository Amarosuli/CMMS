<script lang="ts">
	import { ChevronLeft, CalendarPlus } from 'lucide-svelte';
	import MaterialUnitForm from '$lib/components/page/MaterialUnitForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers.js';
	import { page } from '$app/state';

	let { data } = $props();

	let currentView: 'Edit' | 'Detail' = $state('Detail');
	$effect(() => {
		if (page.url.hash === '#edit') {
			currentView = 'Edit';
		}
	});

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');
</script>

<svelte:head>
	<title>CMMS - Detail Material Unit</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Material Unit</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">{currentView} <span class="text-foreground/50">Material Unit</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(data.unit?.created)}</span></span>
		</div>
		<div class="flex gap-4">
			<Button
				variant="outline"
				onclick={() => {
					if (currentView === 'Detail') {
						currentView = 'Edit';
					} else {
						currentView = 'Detail';
					}
				}}
				class="min-w-20 ">{currentView === 'Detail' ? 'Edit' : 'Detail'}</Button>
		</div>
	</div>
</div>

{#if currentView === 'Edit'}
	<MaterialUnitForm {data} bind:currentView />
{:else if currentView === 'Detail'}
	<div class="mt-12">
		<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Detail of Material Unit</h2>
		<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
		<dl class="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6">
			<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Code</dt>
			<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.unit?.code}</dd>
			<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Description</dt>
			<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.unit?.description}</dd>
		</dl>
	</div>
{/if}

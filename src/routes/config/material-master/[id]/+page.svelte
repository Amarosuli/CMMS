<script lang="ts">
	import { ChevronLeft, CalendarPlus } from 'lucide-svelte';
	import { ImageCarousel, PDFLink } from '$lib/components/costum';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let Unit = data.materialMaster?.expand?.unit_id ? { ...data.materialMaster.expand.unit_id, description: `(${data.materialMaster.expand.unit_id.description})` } : { code: 'Not Defined Yet', description: '' };
</script>

<svelte:head>
	<title>CMMS - Detail Material Master</title>
</svelte:head>

<div>
	<Button href="/config/material-master" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Material Master</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Detail <span class="text-foreground/50">Material Master</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(data.materialMaster?.created)}</span></span>
		</div>
		<div class="flex gap-4">
			<Button variant="outline" onclick={() => goto(page.url.pathname + '/edit')} class="min-w-20 ">Edit</Button>
		</div>
	</div>
</div>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Detail of Material Master</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<dl class="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6">
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Image</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
			{#if data.materialMaster && data.materialMaster.images.length}
				<ImageCarousel id={data.materialMaster!.id} images={data.materialMaster?.images} />
			{:else}
				No Image
			{/if}
		</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Code</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.materialMaster?.code}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Description</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.materialMaster?.description}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Alternate</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
			{#if data.materialMaster && data.materialMaster.alternate}
				{data.materialMaster?.alternate}
			{:else}
				No Alternate
			{/if}
		</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Minimum Quantity</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.materialMaster?.minimum_quantity}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Unit</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{Unit.code} {Unit.description}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Remark</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.materialMaster?.remark || '-'}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Safety Data Sheet (SDS)</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
			{#if data.materialMaster && data.materialMaster.sds}
				<PDFLink id={data.materialMaster.id} name={data.materialMaster.sds} />
			{:else}
				No SDS
			{/if}
		</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Refference</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
			<Button variant="link" class="w-fit p-0" target="_blank" href={data.materialMaster?.url_refference}>{data.materialMaster?.url_refference}</Button>
		</dd>
	</dl>
</div>

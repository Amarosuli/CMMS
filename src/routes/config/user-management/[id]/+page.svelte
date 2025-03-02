<script lang="ts">
	import { ChevronLeft, CalendarPlus } from 'lucide-svelte';
	import { ImageCarousel, PDFLink } from '$lib/components/costum';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();
</script>

<svelte:head>
	<title>CMMS - Detail User</title>
</svelte:head>

<div>
	<Button href="/config/manage/material-master" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>User</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Detail <span class="text-foreground/50">User</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(data.userData?.created)}</span></span>
		</div>
		<div class="flex gap-4">
			<Button variant="outline" onclick={() => goto(page.url.pathname + '/edit')} class="min-w-20 ">Edit</Button>
		</div>
	</div>
</div>

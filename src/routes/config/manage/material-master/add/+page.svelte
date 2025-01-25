<script lang="ts">
	import { LoaderCircle, ChevronLeft, CalendarPlus } from 'lucide-svelte';
	import MaterialMasterForm from '$lib/components/page/MaterialMasterForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { time } from '$lib/helpers.js';
	import { page } from '$app/state';

	let { data } = $props();

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');
</script>

<svelte:head>
	<title>CMMS - Add Material Master</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Material Master</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Add <span class="text-foreground/50">Material Master</span></h1>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
	</div>
</div>

<MaterialMasterForm {data} submitText="Save" redirectUrl="/manage/material-master" />

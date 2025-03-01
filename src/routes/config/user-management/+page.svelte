<script lang="ts">
	import type { RecordModel } from 'pocketbase';

	import { createPageFile } from '$lib/PageTable.svelte';
	import { ChevronLeft } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/state';

	let { data } = $props();
	// i really want to try the createPageFile is generic, maybe type will work
	// like --> createPageFile<'user'>({collectionName: 'user'})
	const pageFile = createPageFile({ collectionName: 'users' });

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');
</script>

<svelte:head>
	<title>CMMS - User Management</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="size-4" />
		<span>Config</span>
	</Button>
</div>

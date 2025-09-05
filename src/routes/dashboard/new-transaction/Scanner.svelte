<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ScanBarcode } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let { isScanning = $bindable() } = $props();

	let dummyItems = $state(['']);
	let items: number[] = $state([]);

	function handleData(event: KeyboardEvent) {
		if (event.key && event.key !== 'Enter') {
			dummyItems = [...dummyItems, event.key];
		} else {
			let result = dummyItems.join('');
			if (isNaN(parseInt(result))) {
				return;
			}
			items = [...items, parseInt(result)];
			dummyItems = [''];
		}
	}

	onMount(() => {
		document.addEventListener('keydown', (event) => handleData(event));
	});
</script>

<div transition:fade={{ duration: 200 }} class="absolute inset-0 z-40 bg-sky-300/50 backdrop-blur-sm">
	<div class="flex h-full w-full flex-col items-center justify-center gap-4">
		<div class="mb-6 flex w-[300px] items-center justify-center gap-4 rounded-lg bg-gray-800 p-6 font-semibold text-white shadow-xl">
			<ScanBarcode class="size-8 animate-pulse" />
			Scanning
			{items}
		</div>
		<Button
			class="cursor-pointer"
			onclick={() => {
				isScanning = false;
			}}>Close Scanner</Button>
	</div>
</div>

<script lang="ts">
	import { Html5Qrcode, type Html5QrcodeResult } from 'html5-qrcode';
	import { createEventDispatcher } from 'svelte';
	import { X, LoaderCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	interface Props {
		scanning?: boolean;
	}

	let { scanning = $bindable(false) }: Props = $props();
	let html5Qrcode: Html5Qrcode;
	let isLoading: boolean = $state(false);
	const dispatch = createEventDispatcher();

	onMount(init);

	function init() {
		html5Qrcode = new Html5Qrcode('reader');
	}

	function start() {
		isLoading = true;
		html5Qrcode
			.start(
				{ facingMode: 'environment' },
				{
					fps: 15,
					qrbox: { width: 300, height: 300 }
				},
				onScanSuccess,
				onScanFailure
			)
			.then(() => {
				isLoading = false;
			});
		// scanning = true;
	}

	function stop() {
		html5Qrcode.stop().then(() => {
			scanning = false;
		});
	}

	function onScanSuccess(decodeText: string, decodeResult: Html5QrcodeResult) {
		toast.info(decodeText);
		dispatch('captured', {
			data: JSON.parse(decodeText)
		});
		stop();
	}

	function onScanFailure(error: string) {
		// console.log('Error ', error);
	}

	$effect(() => {
		if (scanning) start();
	});
</script>

<div class:hidden={!scanning} class="fixed inset-0 isolate z-50 flex w-full flex-col items-center justify-center bg-background/90">
	{#if isLoading}
		<LoaderCircle class="h-8 w-8 animate-spin" />
	{/if}
	<reader id="reader" class="relative flex w-full max-w-[500px] items-center justify-center"></reader>
	<Button variant="ghost" size="icon" onclick={stop} class="fixed bottom-32 rounded-full"><X class="h-8 w-8" /></Button>
</div>

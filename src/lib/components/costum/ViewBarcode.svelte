<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import jsBarcode from 'jsbarcode';
	import { Button } from '../ui/button';
	import { BarcodeIcon } from '@lucide/svelte';
	import type { Action } from 'svelte/action';

	let { data } = $props();

	let open: boolean = $state(false);

	const renderBarcode: Action = (node) => {
		let bn = data?.batch_number;
		jsBarcode(node, bn);
	};
	async function show() {
		open = true;
	}
</script>

<Button variant="outline" size="icon" onclick={show}>
	<BarcodeIcon class="h-4 w-4" />
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title><p class="text-center capitalize">{data.expand.material_id.description.toLowerCase()}</p></Dialog.Title>
		</Dialog.Header>
		<div class="flex items-center justify-center">
			<canvas use:renderBarcode></canvas>
		</div>
		<!-- <Button href={src} download="{data.purchase_order}.png">Download</Button> -->
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { createQrPngDataUrl, type QRConfig } from '@svelte-put/qr';

	import { qr } from '@svelte-put/qr/svg';
	import { Button } from '../ui/button';
	import { QrCode } from 'lucide-svelte';

	let { data } = $props();
	let open: boolean = $state(false);

	const config: QRConfig = { data: JSON.stringify({ stock_id: data.id, material_id: data.material_id }) };

	let src = $state('');
	async function show() {
		open = true;
		src = await createQrPngDataUrl({ ...config, width: 500, height: 500, backgroundFill: '#fff' });
	}
</script>

<Button variant="outline" size="icon" onclick={show}>
	<QrCode class="h-4 w-4" />
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>QR Code - PO {data.purchase_order}</Dialog.Title>
		</Dialog.Header>
		<svg class="" use:qr={config} />
		<Button href={src} download="{data.purchase_order}.png">Download</Button>
	</Dialog.Content>
</Dialog.Root>

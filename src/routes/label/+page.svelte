<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { labelCarts, clearLabelCart, removeFromLabelCart } from '$lib/labelCart.svelte';
	import { Eraser, Asterisk, Newspaper, Printer, X } from '@lucide/svelte';
	import { barcodes, text, rectangle } from '@pdfme/schemas';
	import { ConfirmDialog } from '$lib/components/costum';
	import { generate } from '@pdfme/generator';
	import { Button } from '$lib/components/ui/button';
	import { Viewer } from '@pdfme/ui';
	import { toast } from 'svelte-sonner';

	import barcodeListTemplate from '$lib/components/costum/barcodeListTemplate.json';
	import jsBarcode from 'jsbarcode';

	import type { Action } from 'svelte/action';

	let isPDFPreviewOpen = $state(false);
	let domContainer: HTMLElement = $state({} as HTMLElement);
	let viewer: Viewer | undefined = $state(undefined);
	let infoState = $state('');
	let isLoading = $state(false);

	let confirmDialogOpen = $state(false);

	const renderBarcode: Action<HTMLElement, string, Record<never, string>> = (node, data: string) => {
		let identity: string = data;
		jsBarcode(node, identity, {
			width: 1,
			height: 25,
			fontSize: 10
		});
	};

	function hide() {
		viewer?.destroy();
		isPDFPreviewOpen = false;
	}

	async function show() {
		if (labelCarts.data.length === 0) {
			toast('No labels to print');
			return;
		}

		isPDFPreviewOpen = true;

		let resultObjectArray: Record<string, string>[] = [];
		let currentObject: Record<string, string> = {};

		let keyIndex = 1;
		for (let index = 0; index < labelCarts.data.length; index++) {
			const item = labelCarts.data[index];
			const multiplier = Math.ceil(labelCarts.data.length / 100);

			for (let m = 0; m < multiplier; m++) {
				const key = `{${keyIndex}}bn`;
				currentObject[key] = item.identity || '';

				if (keyIndex === 100) {
					resultObjectArray.push(currentObject);
					currentObject = {};
					keyIndex = 1;
				} else {
					keyIndex++;
				}
			}
		}

		if (Object.keys(currentObject).length > 0) {
			resultObjectArray.push(currentObject);
		}

		let template = JSON.parse(JSON.stringify(barcodeListTemplate));
		const inputs = resultObjectArray;
		const plugins = { code128: barcodes.code128, text: text, rectangle: rectangle };

		if (inputs.length === 0) {
			toast('No labels to print');
			return;
		}
		viewer = new Viewer({ domContainer, template, inputs, plugins });
	}

	async function print() {
		isLoading = true;
		infoState = 'Generate PDF ...';

		let resultObjectArray: Record<string, string>[] = [];
		let currentObject: Record<string, string> = {};

		let keyIndex = 1;
		for (let index = 0; index < labelCarts.data.length; index++) {
			const item = labelCarts.data[index];
			const multiplier = Math.ceil(labelCarts.data.length / 100);

			for (let m = 0; m < multiplier; m++) {
				const key = `{${keyIndex}}bn`;
				currentObject[key] = item.identity || '';

				if (keyIndex === 100) {
					resultObjectArray.push(currentObject);
					currentObject = {};
					keyIndex = 1;
				} else {
					keyIndex++;
				}
			}
		}

		if (Object.keys(currentObject).length > 0) {
			resultObjectArray.push(currentObject);
		}

		let template = JSON.parse(JSON.stringify(barcodeListTemplate));

		const inputs = resultObjectArray;
		const plugins = { code128: barcodes.code128, text: text, rectangle: rectangle };

		generate({ template, inputs, plugins })
			.then((pdf) => {
				const blob = new Blob([pdf.buffer as BlobPart], { type: 'application/pdf' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				const date = new Date();
				const formattedDate = date.toISOString().replace(/:/g, '-').replace(/T/g, '_').split('.')[0];

				link.setAttribute('href', url);
				link.setAttribute('download', `Stock Barcode List_${formattedDate}.pdf`);
				document.body.appendChild(link);

				link.click();

				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			})
			.catch((error) => {
				console.error('Error generating PDF:', error);
			})
			.finally(() => {
				infoState = '';
				isLoading = false;
			});
	}
</script>

<svelte:head>
	<title>CMMS - Label</title>
</svelte:head>

<h1 class="text-2xl/8 font-semibold">Stock Labeling</h1>
<div>{labelCarts.data.length} {labelCarts.data.length <= 1 ? 'label' : 'labels'} ready to print</div>

<div class="mt-4 flex w-full gap-2">
	<ConfirmDialog title="Clear Label Cart" bind:open={confirmDialogOpen} onConfirm={clearLabelCart} />
	<Button
		variant="outline"
		onclick={() => {
			confirmDialogOpen = true;
		}}><Eraser class="size-4" /> Clear Cart</Button>
	{#if isPDFPreviewOpen}
		<Button variant="outline" onclick={hide}><Newspaper class="size-4" /> Edit Cart</Button>
	{:else}
		<Button variant="outline" onclick={show}><Newspaper class="size-4" /> PDF Preview</Button>
	{/if}

	<Button variant="outline" disabled={labelCarts.data.length === 0 || isLoading} onclick={print}><Printer class="size-4" />{infoState ? infoState : 'Print'}</Button>
</div>

{#if labelCarts.data.length === 0}
	<p class="mt-4 flex w-full items-center gap-2 text-yellow-600"><Asterisk class="size-4" /> No labels to print</p>
{/if}

{#if !isPDFPreviewOpen}
	<p class="mt-2 flex w-full items-center gap-2 text-yellow-600 lg:hidden"><Asterisk class="size-4" /> Web preview not available in mobile screen</p>

	<div class="mt-4 hidden w-full flex-wrap lg:flex">
		{#each labelCarts.data as label (label.identity)}
			<Tooltip.Root disableCloseOnTriggerClick>
				<Tooltip.Trigger class="relative flex w-1/5 shrink-0 flex-col items-center justify-center border-[0.5px] py-2 text-[0.75rem]">
					<Button class="absolute right-2 bottom-2 bg-red-200/50 hover:bg-red-200 dark:bg-red-400/50  dark:hover:bg-red-200" size="sm" variant="ghost" onclick={() => removeFromLabelCart(label.identity)}><X class="size-4 font-semibold text-red-500" /></Button>
					<div class="flex items-center justify-center">
						<canvas use:renderBarcode={label.identity}></canvas>
					</div>
					<p class="text-primary">{label.expand?.stock_master_id.expand.material_master_id.part_number}</p>
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" arrowClasses="bg-slate-800 fill-slate-800 dark:bg-slate-300 dark:fill-slate-800" class="bg-slate-800 p-4 text-background dark:bg-slate-300">
					<div class="flex flex-col text-sm tracking-wide">
						<p class="text-md font-bold tracking-wider">Batch: {label.expand?.stock_master_id.batch_number}</p>
						<p class="text-xs tracking-wider">Part Number: {label.expand?.stock_master_id.expand.material_master_id.part_number}</p>
						<p class="text-xs tracking-wider">Description: {label.expand?.stock_master_id.expand.material_master_id.description}</p>
					</div>
					<Tooltip.Portal disabled></Tooltip.Portal>
				</Tooltip.Content>
			</Tooltip.Root>
		{/each}
	</div>
{/if}

<div bind:this={domContainer} class="absolute z-40 mt-4 h-screen w-screen" hidden={!isPDFPreviewOpen}></div>

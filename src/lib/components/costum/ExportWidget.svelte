<script lang="ts">
	import Papa from 'papaparse';
	import type { StockMaster } from '$lib/CostumTypes';
	import type { PageFile } from '$lib/PageTable.svelte';
	// import { type Template } from '@pdfme/common';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { buttonVariants } from '../ui/button';
	import { Button } from '../ui/button';
	import { generate } from '@pdfme/generator';
	import { barcodes, text, rectangle } from '@pdfme/schemas';
	import { barcodeListTemplate } from './barcodeListTemplate';
	import { LoaderCircle } from '@lucide/svelte';

	let { pageFile }: { pageFile: PageFile } = $props();

	let infoState = $state('');

	let isLoading = $state(false);
	const pageFileB = pageFile;

	async function getCSV() {
		isLoading = true;
		infoState = 'Generate CSV ...';
		const data = (await pageFileB.getAll({ expand: 'material_id' })) as StockMaster[];

		const mapped = data.map((d) => {
			return {
				Description: d.expand?.material_id.description,
				'Part Number': d.expand?.material_id.part_number,
				'Batch Number': d.batch_number,
				'Purchase Order': d.purchase_order,
				Created: d.created,
				'Expired Date': d.expired_date,
				'Quantity Available': d.quantity_available,
				'Quantity Borrowed': d.quantity_borrowed
			};
		});

		const csv = Papa.unparse(mapped);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.setAttribute('href', url);
		link.setAttribute('download', 'Stock Master.csv');
		document.body.appendChild(link); // Append to the body temporarily

		link.click();

		document.body.removeChild(link); // Remove the link after clicking
		URL.revokeObjectURL(url); // Free up the temporary URL resource

		infoState = '';
		isLoading = false;
	}

	async function getPDFBarcodeList() {
		isLoading = true;
		infoState = 'Generate PDF ...';

		const data = (await pageFileB.getAll({ expand: 'material_id', filter: 'quantity_available>0' })) as StockMaster[];
		let resultObjectArray: Record<string, string>[] = [];
		let currentObject: Record<string, string> = {};
		let keyIndex = 1;

		for (let index = 0; index < data.length; index++) {
			const item = data[index];
			const multiplier = data[index].quantity_available;

			for (let m = 0; m < multiplier; m++) {
				const key = `{${keyIndex}}bn`;
				currentObject[key] = item.batch_number;
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

		const template = barcodeListTemplate;
		const inputs = resultObjectArray;
		const plugins = { code128: barcodes.code128, text: text, rectangle: rectangle };

		generate({ template, inputs, plugins })
			.then((pdf) => {
				const blob = new Blob([pdf.buffer as BlobPart], { type: 'application/pdf' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');

				link.setAttribute('href', url);
				link.setAttribute('download', 'Stock Barcode List.pdf');
				document.body.appendChild(link); // Append to the body temporarily

				link.click();

				document.body.removeChild(link); // Remove the link after clicking
				URL.revokeObjectURL(url); // Free up the temporary URL resource
			})
			.finally(() => {
				infoState = '';
				isLoading = false;
			});
	}

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={buttonVariants({ variant: 'outline' })}
		onclick={() => {
			open = !open;
		}}>Export</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Export</Dialog.Title>
			<Dialog.Description>Currently available for export to CSV and PDF</Dialog.Description>
		</Dialog.Header>
		<div class="flex h-3 gap-4 pb-4">
			{#if isLoading}
				<LoaderCircle class="text-primary h-5 w-5 animate-spin" />
			{/if}
			<p class="ml-2 h-3 text-sm font-semibold tracking-wider">
				{infoState}
			</p>
		</div>
		<Dialog.Footer class="mx-auto justify-center">
			<Button class="cursor-pointer" disabled={isLoading} onclick={getCSV}>Export CSV</Button>
			<Button class="cursor-pointer" disabled={isLoading} onclick={getPDFBarcodeList}>Export PDF (List Barcode)</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

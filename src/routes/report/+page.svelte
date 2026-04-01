<script lang="ts">
	import { getLocalTimeZone, startOfWeek, startOfMonth, endOfWeek, endOfMonth, today, type DateValue } from '@internationalized/date';
	import { getBorrowingReport } from './report.remote';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
   import ExcelJS from 'exceljs';


	import type { DateRange } from 'bits-ui';
	import { LoaderCircle } from '@lucide/svelte';


	async function exportToExcel(data: any[]) {
		const workbook = new ExcelJS.Workbook();
      const response = await fetch('/Template_R-043_R0.xlsx');
      const arrayBuffer = await response.arrayBuffer();

      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.getWorksheet(1); 

      if (!worksheet) {
         console.error('Worksheet not found in the template!');
         return;
      }

        worksheet.getCell('L2').value = `${value.start} to ${value.end}`;
        worksheet.pageSetup.printTitlesRow = '1:9';
        worksheet.pageSetup.printArea = `A1:M${10 + data.length}`;
      
      let startRow = 10; 

      data.forEach((item, index) => {
         const currentRow = worksheet.getRow(startRow + index);
         
         currentRow.getCell(1).value = index + 1;         // Col A
         currentRow.getCell(2).value = item.date;         // Col B
         currentRow.getCell(3).value = item.requester;    // Col C
         currentRow.getCell(4).value = item.idNo;         // Col D
         currentRow.getCell(5).value = item.partNumber;   // Col E
         currentRow.getCell(6).value = item.description;  // Col F
         currentRow.getCell(7).value = item.qty;          // Col G
         currentRow.getCell(8).value = item.po;           // Col H
         currentRow.getCell(9).value = item.bn;           // Col I
         currentRow.getCell(10).value = item.expiredDate || 'N/A';  // Col J
         currentRow.getCell(11).value = item.condition;  // Col K
         currentRow.getCell(12).value = item.orderNumber; // Col L
         currentRow.getCell(13).value = item.returned; // Col M
         
         // currentRow.commit();
	})
   
   const buffer = await workbook.xlsx.writeBuffer();
   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');

   link.setAttribute('href', url);
		link.setAttribute('download', `Borrowing Report ${value.start} to ${value.end}.xlsx`);
		document.body.appendChild(link); // Append to the body temporarily

		link.click();

		document.body.removeChild(link); // Remove the link after clicking
		URL.revokeObjectURL(url); // Free up the temporary URL resource

      isExportLoading = false;
}

	const lastDayTime = '23:59:59.999Z';
	const firstDayTime = '00:00:00.000Z';

	let now = today(getLocalTimeZone());
	let isLoading = $state(false);
	type BorrowingReportItem = {
		id: string;
		date: any;
		requester: any;
		idNo: any;
		partNumber: any;
		description: any;
		qty: string;
		po: any;
		bn: any;
		expiredDate: any;
		condition: any;
		orderNumber: any;
		returned: any;
	};

	let borrowingReport = $state<BorrowingReportItem[]>([]);

	onMount(() => {
		setRange('today');
	});

	function getValue() {
		return value;
	}

	function setValue(newValue: DateRange) {
		value = newValue;
	}

	let value = $state<DateRange>({ start: now, end: now });

	function setRange(preset: 'today' | 'thisWeek' | 'thisMonth' | 'lastWeek' | 'lastMonth') {
		activePreset = preset;
      isExportBtnActive = false

		const ranges = {
			today: [now, now],
			thisWeek: [startOfWeek(now, 'en-US'), endOfWeek(now, 'en-US')],
			thisMonth: [startOfMonth(now), endOfMonth(now)],
			lastWeek: [startOfWeek(now.subtract({ weeks: 1 }), 'en-US'), endOfWeek(now.subtract({ weeks: 1 }), 'en-US')],
			lastMonth: [startOfMonth(now.subtract({ months: 1 })), endOfMonth(now.subtract({ months: 1 }))]
		};

		const [start, end] = ranges[preset];
		setValue({ start, end });
	}

	let status: string = $state('CLOSED');

	let stringFilter = $derived.by(() => {
		const statusFilter = `status="${status}"`;
		if (!value.end || value.start?.compare(value.end) === 0) {
			return `${statusFilter} && borrowDate >= "${value.start} ${firstDayTime}" && borrowDate <= "${value.start} ${lastDayTime}"`;
		} else {
			return `${statusFilter} && borrowDate >= "${value.start} ${firstDayTime}" && borrowDate <= "${value.end} ${lastDayTime}"`;
		}
	});

	let isExportBtnActive = $state(false);
	let isExportLoading = $state(false);
	let activePreset = $state<'today' | 'thisWeek' | 'thisMonth' | 'lastWeek' | 'lastMonth' | null>('today');
</script>

<svelte:head>
	<title>CMMS - Report</title>
</svelte:head>

<h1 class="text-2xl/8 font-semibold">Borrowing Report</h1>

<p class="pt-2 font-bold">Choose Status</p>
<div class="flex gap-2 pt-2">
	<Button
   class={status === 'OPEN' ? 'bg-primary dark:bg-primary-foreground text-foreground hover:bg-primary/90 dark:hover:bg-primary-foreground/90' : ''}
		variant="outline"
		size="sm"
		onclick={() => {
			status = 'OPEN';
		}}>Get Open Only</Button>
	<Button
   class={status === 'CLOSED' ? 'bg-primary dark:bg-primary-foreground text-foreground hover:bg-primary/90 dark:hover:bg-primary-foreground/90' : ''}
		variant="outline"
		size="sm"
		onclick={() => {
			status = 'CLOSED';
		}}>Get Closed Only</Button>
</div>
<p class="pt-2 font-bold">Choose Range</p>
<div class="grid grid-cols-2 md:flex gap-2 pt-2">
	<Button
   class={activePreset === 'today' ? 'bg-primary dark:bg-primary-foreground text-foreground hover:bg-primary/90 dark:hover:bg-primary-foreground/90' : ''}
		variant="outline"
		size="sm"
		onclick={() => {
			setRange('today');
		}}>Today</Button>
	<Button
   class={activePreset === 'thisWeek' ? 'bg-primary dark:bg-primary-foreground text-foreground hover:bg-primary/90 dark:hover:bg-primary-foreground/90' : ''}
		variant="outline"
		size="sm"
		onclick={() => {
			setRange('thisWeek');
		}}>This Week</Button>
	<Button
   class={activePreset === 'thisMonth' ? 'bg-primary dark:bg-primary-foreground text-foreground hover:bg-primary/90 dark:hover:bg-primary-foreground/90' : ''}

		variant="outline"
		size="sm"
		onclick={() => {
			setRange('thisMonth');
		}}>This Month</Button>
	<Button
   class={activePreset === 'lastWeek' ? 'bg-primary dark:bg-primary-foreground text-foreground hover:bg-primary/90 dark:hover:bg-primary-foreground/90' : ''}

		variant="outline"
		size="sm"
		onclick={() => {
			setRange('lastWeek');
		}}>Last Week</Button>
	<Button
   class={activePreset === 'lastMonth' ? 'bg-primary dark:bg-primary-foreground text-foreground hover:bg-primary/90 dark:hover:bg-primary-foreground/90' : ''}

		variant="outline"
		size="sm"
		onclick={() => {
			setRange('lastMonth');
		}}>Last Month</Button>
</div>
<div class="w-fit pt-2">
	<RangeCalendar
      onValueChange={() => {
        activePreset = null;
      }}  
		bind:value={getValue, setValue}
		class="rounded-md border" />
</div>

<div class="mt-8 flex flex-col lg:flex-row md:items-end items-center justify-between">
	<h2 class="text-base/7 text-center md:text-start font-semibold">Summary of <span class="capitalize bg-foreground text-background py rounded-full text-sm px-3">{status.toLowerCase()}</span> Borrowing Records for <span class="bg-foreground text-background py rounded-full text-sm px-3">{value.start}</span> to <span class="bg-foreground text-background py rounded-full text-sm px-3">{value.end ? value.end : value.start}</span></h2>
	<div class="mt-4 md:mt-0">
		<Button
			variant="outline"
			size="sm"
			onclick={() => {
				isLoading = true;
				getBorrowingReport(stringFilter)
					.then((report) => {
						borrowingReport = report;
						console.log(report);
					})
					.catch((er) => {
						console.error(er);
					})
					.finally(() => {
						isLoading = false;
                  isExportBtnActive = borrowingReport.length > 0;
					});
			}}>
			{#if isLoading}
				Wait...
				<LoaderCircle class="text-primary ml-2 h-4 w-4 animate-spin" />
			{:else}
				Load Report
			{/if}
		</Button>
		<Button
			disabled={!isExportBtnActive}
			variant="outline"
			size="sm"
			onclick={() => {
				isExportLoading = true;
            exportToExcel(borrowingReport)
			}}>
			{#if isExportLoading}
				Wait...
				<LoaderCircle class="text-primary ml-2 h-4 w-4 animate-spin" />
			{:else}
				Export
			{/if}
		</Button>
	</div>
</div>
<div class="mt-4">
	<div>
		<hr role="presentation" class="mb-4 w-full border-t" />

		{#each borrowingReport as item}
			<div class="mb-2 flex flex-col md:flex-row gap-2 text-xs rounded-md border p-2 items-start">
				<p class="md:w-3/12 bg-background wrap-break-word"> {item.date}</p>
				<p class="md:w-2/12 bg-background wrap-break-word capitalize"> {item.requester.toLowerCase()}</p>
				<p class="md:w-1/12 bg-background wrap-break-word"> {item.idNo}</p>
				<p class="md:w-4/12 bg-background wrap-break-word"> {item.partNumber}</p>
				<p class="md:w-6/12 bg-background wrap-break-word"> {item.description}</p>
				<p class="md:w-1/12 bg-background wrap-break-word"> {item.qty}</p>
				<p class="md:w-3/12 bg-background wrap-break-word"> {item.po}</p>
				<p class="md:w-3/12 bg-background wrap-break-word"> {item.bn}</p>
				<p class="md:w-3/12 bg-background wrap-break-word"> {item.expiredDate}</p>
				<p class="md:w-2/12 bg-background wrap-break-word"> {item.condition}</p>
				<p class="md:w-3/12 bg-background wrap-break-word"> {item.orderNumber}</p>
				<p class="md:w-1/12 bg-background wrap-break-word"> {item.returned}</p>
			</div>
		{/each}

		{#if borrowingReport.length === 0 && !isLoading}
			<p class="text-muted-foreground">No borrowing records found for the selected criteria.</p>
		{/if}
	</div>
</div>

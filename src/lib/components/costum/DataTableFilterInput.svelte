<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import ListFilter from 'lucide-svelte/icons/list-filter';
	import X from 'lucide-svelte/icons/x';

	import type { RecordModel } from 'pocketbase';
	import type { ColumnDef } from '@tanstack/table-core';

	let tagArray: string[] = $state([]);
	let filterActive: boolean = $state(false);

	let { columns }: { columns: ColumnDef<RecordModel>[] } = $props();
</script>

<Table.Row>
	<Table.Head colspan={columns.length}>
		<div class="relative flex items-center gap-2">
			<ListFilter class="h-4 w-4 flex-shrink-0" />
			<div class="flex gap-2 pl-2">
				{#each tagArray as tag, index}
					<div class="flex h-7 w-fit items-center justify-center gap-2 overflow-hidden rounded-lg border bg-foreground/10 pl-3 text-foreground">
						{tag}
						<button
							onclick={() => {
								tagArray.splice(index, 1);
							}}
							class="bg-yellow-300 px-2 py-2 hover:bg-yellow-200"><X class="h-4 w-4 text-black" /></button>
					</div>
				{/each}
			</div>

			<input
				class="relative h-7 w-full rounded-lg bg-foreground/10 px-4 py-2"
				placeholder="Filter..."
				onfocus={() => (filterActive = true)}
				onfocusout={() => (filterActive = false)}
				onkeypress={(e) => {
					if (e.key === 'Enter') {
						tagArray.push(e.currentTarget.value);
						e.currentTarget.value = '';
					}
				}} />
			{#if filterActive}
				<span class="absolute -bottom-full z-20 bg-blue-50 p-4">tool</span>
			{/if}
		</div>
	</Table.Head>
</Table.Row>

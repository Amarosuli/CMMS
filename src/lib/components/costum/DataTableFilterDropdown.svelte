<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Filter, Plus } from 'lucide-svelte';
	import type { PageFile } from '$lib/PageTable.svelte';

	let baseList: string[] = $state(['id', 'created', 'updated']);
	let list: boolean[] = $state([]);

	let { pageFile }: { pageFile: PageFile } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">
				Filter <Filter class="ml-2 size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		{#if list.length === 0}
			<div class="flex flex-col gap-2 divide-y p-2">
				<div>No filters selected</div>
				<Button onclick={() => list.push(false)} class="flex items-center justify-center gap-2 py-2"><Plus class="h-4 w-4" /> Add a filter</Button>
			</div>
		{/if}
		{#each list as item}
			<div class="flex flex-col gap-2 divide-y p-2">
				<div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="outline">Column</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<!-- {#each baseList as bl, index}
								<DropdownMenu.CheckboxItem class="capitalize" bind:checked={() => list[index], (v) => (list[index] = v)}>
									{bl}
								</DropdownMenu.CheckboxItem>
							{/each} -->
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
			<!-- <DropdownMenu.CheckboxItem class="capitalize" bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}>
            {column.id}
            </DropdownMenu.CheckboxItem> -->
		{/each}
		<Button onclick={() => list.push(false)} class="flex items-center justify-center gap-2 py-2"><Plus class="h-4 w-4" /> Add a filter</Button>
	</DropdownMenu.Content>
</DropdownMenu.Root>

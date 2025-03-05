<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { BookUser, BrickWall, FileType, PencilRuler, type Icon as IconType } from 'lucide-svelte';

	let configs = [
		{
			group: 'Master Data',
			item: [
				{
					title: 'Material Master',
					description: 'Setup you material master, code, minimum quantity, etc.',
					icon: BrickWall,
					url: page.url.pathname + '/manage/material-master'
				},
				{
					title: 'Material Unit',
					description: 'Customize your material unit for unit of measurement.',
					icon: PencilRuler,
					url: page.url.pathname + '/manage/material-unit'
				},
				{
					title: 'Material Group',
					description: 'Type to define the group of material.',
					icon: FileType,
					url: page.url.pathname + '/material-group'
				},
				{
					title: 'Transaction Type',
					description: 'Type to define the movement type.',
					icon: FileType,
					url: page.url.pathname + '/manage/transaction-type'
				}
			]
		},
		{
			group: 'User',
			item: [
				{
					title: 'User Management',
					description: 'Customize your dedicated team',
					icon: BookUser,
					url: page.url.pathname + '/user-management'
				}
			]
		}
	];
</script>

{#snippet icon(item: typeof IconType)}
	{@const Icon = item}
	<Icon class="mb-2 h-6 w-6 text-primary" />
{/snippet}

<div class="flex w-full flex-col justify-start space-y-2">
	{#each configs as config}
		<h1 class="text-sm font-semibold">{config.group}</h1>
		<div class="grid w-full grid-flow-row grid-cols-1 items-center justify-between gap-4 pb-2 md:grid-cols-3">
			{#each config.item as item}
				<Button variant="outline" href={item.url} class="flex h-24 w-full  items-center p-4">
					<div class="flex h-full w-full flex-col">
						{@render icon(item.icon)}
						<span class="font-semibold">{item.title}</span>
						<span class="truncate text-xs">{item.description}</span>
					</div>
				</Button>
			{/each}
		</div>
		<Separator />
	{/each}
</div>

<script>
	import { ChevronRight } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Render } from 'svelte-headless-table';

	export let sidebarMenu;
	export let currentHash;
	export let currentPath;
</script>

<div class="flex flex-col border-b p-4 [&>[data-slot=section]+[data-slot=section]]:mt-2.5">
	<span class="relative">
		<Button variant="ghost" class="w-full">
			<h1 class="text-xl font-extrabold">CMMS</h1>
		</Button>
	</span>
</div>
<div class="flex flex-1 flex-col overflow-y-auto p-4 [&>[data-slot=section]+[data-slot=section]]:mt-8">
	<div class="flex flex-col">
		{#each sidebarMenu as menu}
			<span class="relative">
				<span class="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-primary {currentPath === menu.url ? '' : 'hidden'}"></span>
				<Button variant="ghost" class="flex w-full justify-start font-semibold text-slate-700" href={`${menu.url}${menu.defaultHash ? menu.defaultHash : ''}`}>
					<Render of={menu.icon} />
					<span class="truncate">{menu.title}</span>
				</Button>
			</span>
			{#if menu.sub}
				{#each menu.sub as sub}
					<span class="relative">
						<Button variant="ghost" class="flex w-full justify-start pl-6 font-semibold text-slate-700 " href={menu.url + sub.hash}>
							<ChevronRight class="mr-2 h-4 w-4 {currentHash === sub.hash ? 'text-primary' : ''}" />
							<span class="truncate">{sub.title}</span>
						</Button>
					</span>
				{/each}
			{/if}
		{/each}
	</div>
</div>

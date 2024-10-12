<script>
	import { ChevronRight, MoveRight } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Render } from 'svelte-headless-table';
	import { toggleMode } from 'mode-watcher';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';

	export let sidebarMenu;
	export let currentHash;
	export let currentPath;
</script>

<div class="flex flex-col border-b p-4 [&>[data-slot=section]+[data-slot=section]]:mt-2.5">
	<span class="relative">
		<Button variant="ghost" class="flex w-full items-center justify-start">
			<h1 class="text-left text-2xl font-extrabold text-primary">CMMS</h1>
			<div class="ml-2 flex flex-col items-center justify-center text-[0.6rem]/3 text-foreground">
				<span>Consumable Material</span>
				<span>Management System</span>
			</div>
		</Button>
	</span>
</div>
<div class="flex flex-1 flex-col overflow-y-auto p-4 [&>[data-slot=section]+[data-slot=section]]:mt-8">
	<div class="flex flex-col">
		{#each sidebarMenu as menu}
			<span class="relative">
				<span class="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-primary {currentPath === menu.url ? '' : 'hidden'}"></span>
				<Button variant="ghost" class="flex w-full justify-start font-semibold text-secondary-foreground" href={`${menu.url}${menu.defaultHash ? menu.defaultHash : ''}`}>
					<Render of={menu.icon} />
					<span class="truncate">{menu.title}</span>
				</Button>
			</span>
			{#if menu.sub}
				{#each menu.sub as sub}
					<span class="relative">
						<Button variant="ghost" class="flex w-full justify-start pl-6 font-semibold text-secondary-foreground " href={menu.url + sub.hash}>
							<ChevronRight class="mr-2 h-4 w-4 {currentHash === sub.hash ? 'text-primary' : ''}" />
							<span class="truncate">{sub.title}</span>
						</Button>
					</span>
				{/each}
			{/if}
		{/each}
	</div>
</div>
<div class="flex flex-1 flex-col justify-end overflow-y-auto p-4 [&>[data-slot=section]+[data-slot=section]]:mt-8">
	<span class="relative flex items-center justify-between">
		<span class="inline-flex items-center gap-4 text-xs"
			>Switch Theme
			<MoveRight class="h w-4" />
		</span>
		<Button on:click={toggleMode} variant="outline" size="icon" class="text-primary">
			<Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span class="sr-only">Toggle theme</span>
		</Button>
	</span>
</div>

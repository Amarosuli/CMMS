<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	// icons
	import { ChevronRight, MoveRight, Moon, Sun, type Icon as IconType } from '@lucide/svelte';

	interface Props {
		sidebarMenu: any;
		currentHash: string;
		currentPath: string;
		currentRole: string;
	}

	let { sidebarMenu, currentHash, currentPath, currentRole }: Props = $props();
</script>

{#snippet icon(item: typeof IconType)}
	{@const Icon = item}
	<Icon class="mr-2 h-4 w-4" />
{/snippet}

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
			<span class="relative" class:hidden={currentRole === undefined ? menu.role !== undefined : currentRole === 'super' ? false : currentRole === 'admin' ? menu.role === 'super' : currentRole === 'general' ? menu.role === 'super' || menu.role === 'admin' : false}>
				<span class="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-primary {currentPath === menu.url ? '' : 'hidden'}"></span>
				<Button variant="ghost" class="flex w-full justify-start font-semibold text-secondary-foreground" href={menu.url}>
					{@render icon(menu.icon)}
					<span class="truncate">{menu.title}</span>
				</Button>
			</span>
			{#if menu.sub}
				{#each menu.sub as sub}
					<span class="relative" class:hidden={currentRole === undefined ? menu.role !== undefined : currentRole === 'super' ? false : currentRole === 'admin' ? menu.role === 'super' : currentRole === 'general' ? menu.role === 'super' || menu.role === 'admin' : false}>
						<Button variant="ghost" class="flex w-full justify-start pl-6 font-semibold text-secondary-foreground " href={menu.url + sub.url}>
							<ChevronRight class="mr-2 h-4 w-4 {currentHash === sub.url ? 'text-primary' : ''}" />
							<span class="truncate">{sub.title}</span>
						</Button>
					</span>
				{/each}
			{/if}
		{/each}
	</div>
</div>
<div class="flex flex-col justify-end overflow-y-auto border-t p-4 [&>[data-slot=section]+[data-slot=section]]:mt-8">
	<span class="relative flex items-center justify-between">
		<span class="inline-flex items-center gap-4 text-xs"
			>Switch Theme
			<MoveRight class="h w-4" />
		</span>
		<Button onclick={toggleMode} variant="outline" size="icon" class="text-primary">
			<Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span class="sr-only">Toggle theme</span>
		</Button>
	</span>
</div>

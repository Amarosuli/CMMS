<script>
	import * as Sheet from '$lib/components/ui/sheet';
	import { NavbarDD, NavbarContent, NavbarLogin } from '.';
	import { afterNavigate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	// icons
	import { AlignLeft } from 'lucide-svelte';

	export let sidebarMenu;
	export let currentRole;
	export let currentPath;
	export let currentHash;
	export let user;
	export let openLoginDialog = false;
	export let logOut;

	let open = false;
	afterNavigate(() => {
		open = false;
	});
</script>

<header class="flex items-center px-4 lg:hidden">
	<div class="py-2.5">
		<span class="relative">
			<Sheet.Root bind:open>
				<Sheet.Trigger asChild let:builder>
					<Button builders={[builder]} variant="outline">
						<AlignLeft class="h-4 w-4" />
					</Button>
				</Sheet.Trigger>

				<Sheet.Content side="left">
					<NavbarContent {sidebarMenu} {currentHash} {currentPath} {currentRole} />
				</Sheet.Content>
			</Sheet.Root>
		</span>
	</div>
	<div class="min-w-0 flex-1">
		<nav class="flex flex-1 items-center gap-4 py-2.5">
			<div aria-hidden="true" class="-ml-4 flex-1"></div>
			<div class="flex items-center gap-3">
				{#if user}
					<NavbarDD {logOut} {user} />
				{:else}
					<NavbarLogin bind:openLoginDialog />
				{/if}
			</div>
		</nav>
	</div>
</header>

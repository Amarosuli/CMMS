<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { NavbarDD, NavbarContent, NavbarLogin } from '.';
	import { buttonVariants } from '$lib/components/ui/button';
	import { TextAlignStart } from '@lucide/svelte';
	import { afterNavigate } from '$app/navigation';
	import type { SideBarMenu } from './NavbarContent.svelte';
	import type { AuthRecord } from 'pocketbase';

	interface Props {
		sidebarMenu: SideBarMenu[];
		currentRole: string;
		currentPath: string;
		currentHash: string;
		user: AuthRecord;
		openLoginDialog?: boolean;
	}

	let { sidebarMenu, currentRole, currentPath = $bindable(), currentHash = $bindable(), user, openLoginDialog = $bindable(false) }: Props = $props();

	let open = $state(false);
	afterNavigate(() => {
		open = false;
	});
</script>

<header class="flex items-center px-4 lg:hidden">
	<div class="py-2.5">
		<span class="relative">
			<Sheet.Root bind:open>
				<Sheet.Trigger class={buttonVariants({ variant: 'outline' })}>
					<TextAlignStart class="h-4 w-4" />
				</Sheet.Trigger>

				<Sheet.Content side="left" class="p-0">
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
					<NavbarDD {user} />
				{:else}
					<NavbarLogin bind:openLoginDialog />
				{/if}
			</div>
		</nav>
	</div>
</header>

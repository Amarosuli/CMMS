<script lang="ts">
	import { NavbarDD, NavbarLogin, NavbarContent } from '.';
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
</script>

<div class="fixed inset-y-0 left-0 w-64 max-lg:hidden">
	<nav class="flex h-full min-h-0 flex-col">
		<NavbarContent {sidebarMenu} {currentHash} {currentPath} {currentRole} />
		<div class="flex flex-col border-t p-4 max-lg:hidden [&>[data-slot=section]+[data-slot=section]]:mt-2.5">
			{#if user}
				<NavbarDD {user} />
			{:else}
				<NavbarLogin bind:openLoginDialog />
			{/if}
		</div>
	</nav>
</div>

<script>
	import { NavbarDD, NavbarLogin, NavbarContent } from '.';

	/** @type {{sidebarMenu: any, currentRole: any, currentPath: any, currentHash: any, user: any, openLoginDialog?: boolean, logOut: any}} */
	let { sidebarMenu, currentRole, currentPath = $bindable(), currentHash = $bindable(), user, openLoginDialog = $bindable(false), logOut } = $props();
</script>

<div class="fixed inset-y-0 left-0 w-64 max-lg:hidden">
	<nav class="flex h-full min-h-0 flex-col">
		<NavbarContent {sidebarMenu} {currentHash} {currentPath} {currentRole} />
		<div class="flex flex-col border-t p-4 max-lg:hidden [&>[data-slot=section]+[data-slot=section]]:mt-2.5">
			{#if user}
				<NavbarDD {logOut} {user} />
			{:else}
				<NavbarLogin bind:openLoginDialog />
			{/if}
		</div>
	</nav>
</div>

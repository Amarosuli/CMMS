<script>
	import { NavbarDD, NavbarLogin, NavbarContent } from '.';

	export let sidebarMenu;
	export let currentRole;
	export let currentPath;
	export let currentHash;
	export let user;
	export let openLoginDialog = false;
	export let logOut;
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

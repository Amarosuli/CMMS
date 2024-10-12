<script lang="ts">
	import { Navbar, NavbarSmall } from '$lib/layouts';
	import { createRender } from 'svelte-headless-table';
	import { LoginDialog } from '$lib/layouts/pages';
	import { page } from '$app/stores';
	// icons
	import SquareKanban from 'lucide-svelte/icons/square-kanban';
	import Archive from 'lucide-svelte/icons/archive';
	import House from 'lucide-svelte/icons/house';

	import '../app.css';

	export let data;
	const { user } = data;

	let openLoginDialog = false;

	async function logOut() {
		const response = await fetch('/auth', { method: 'GET' });
		const { message } = await response.json();
		if (message === 'success') location.reload();
	}

	const sidebarMenu = [
		{
			title: 'Home',
			icon: createRender(House, { class: 'mr-2 h-4 w-4' }),
			url: '/'
		},
		{
			title: 'Inventory',
			icon: createRender(Archive, { class: 'mr-2 h-4 w-4' }),
			url: '/inventory'
		},
		{
			title: 'Master',
			icon: createRender(SquareKanban, { class: 'mr-2 h-4 w-4' }),
			url: '/manage',
			defaultHash: '#material-master',
			sub: [
				{
					title: 'Material Master',
					hash: '#material-master'
				},
				{
					title: 'Material Unit',
					hash: '#material-unit'
				}
			]
		}
	];

	$: currentHash = $page.url.hash;
	$: currentPath = $page.url.pathname;
</script>

<div class="relative isolate flex min-h-svh w-full bg-secondary max-lg:flex-col">
	<Navbar bind:currentHash bind:currentPath {sidebarMenu} {user} bind:openLoginDialog {logOut} />
	<NavbarSmall bind:currentHash bind:currentPath {sidebarMenu} {user} bind:openLoginDialog {logOut} />
	<main class="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pl-64 lg:pr-2 lg:pt-2">
		<LoginDialog bind:open={openLoginDialog} />
		<div class="grow bg-white p-6 lg:rounded-lg lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
			<div class="mx-auto max-w-6xl">
				<slot></slot>
			</div>
		</div>
	</main>
</div>

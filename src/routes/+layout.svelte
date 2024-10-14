<script lang="ts">
	import '../app.css';

	import { Navbar, NavbarSmall } from '$lib/layouts';
	import { createRender } from 'svelte-headless-table';
	import { LoginDialog } from '$lib/layouts/pages';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { page } from '$app/stores';
	// icons
	import SquareKanban from 'lucide-svelte/icons/square-kanban';
	import SendToBack from 'lucide-svelte/icons/send-to-back';
	import Archive from 'lucide-svelte/icons/archive';
	import House from 'lucide-svelte/icons/house';

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
			title: 'Stock',
			icon: createRender(Archive, { class: 'mr-2 h-4 w-4' }),
			url: '/stock'
		},
		{
			title: 'Movement',
			icon: createRender(SendToBack, { class: 'mr-2 h-4 w-4' }),
			url: '/movement'
		},
		{
			title: 'Master',
			icon: createRender(SquareKanban, { class: 'mr-2 h-4 w-4' }),
			url: '/manage',
			defaultHash: '#material-master',
			sub: [
				{
					title: 'Material Master',
					hash: '/material-master'
				},
				{
					title: 'Material Unit',
					hash: '/material-unit'
				},
				{
					title: 'Transaction Type',
					hash: '/transaction-type'
				}
			]
		}
	];

	$: currentHash = $page.url.hash;
	$: currentPath = $page.url.pathname;
</script>

<Toaster />
<ModeWatcher />
<div class="relative isolate flex min-h-svh w-full bg-primary/5 max-lg:flex-col">
	<Navbar bind:currentHash bind:currentPath {sidebarMenu} {user} bind:openLoginDialog {logOut} />
	<NavbarSmall bind:currentHash bind:currentPath {sidebarMenu} {user} bind:openLoginDialog {logOut} />
	<main class="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pl-64 lg:pr-2 lg:pt-2">
		<LoginDialog bind:open={openLoginDialog} />
		<div class="grow bg-background p-6 text-foreground lg:rounded-lg lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-secondary-foreground/10">
			<div class="mx-auto max-w-6xl">
				<slot></slot>
			</div>
		</div>
	</main>
</div>

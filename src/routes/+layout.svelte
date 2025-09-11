<script lang="ts">
	import '../app.css';

	import { Navbar, NavbarSmall, LoginDialog } from '$lib/components/layout';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	// icons
	import { SendToBack, Archive, FolderInput, FolderOutput, House, LoaderCircle, Settings, LayoutDashboard } from '@lucide/svelte';

	interface Props {
		data: any;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	const { user } = data;

	let openLoginDialog: boolean = $state(false);
	let isLogOut: boolean = $state(false);
	let loadingPage: boolean = $state(false);

	async function logOut() {
		isLogOut = true;
		const response = await fetch('/auth', { method: 'GET' });
		const { message } = await response.json();
		if (message === 'success') location.reload();
	}

	const Role = {
		GENERAL: 'general',
		ADMIN: 'admin',
		SUPER: 'super'
	};

	const sidebarMenu = [
		{
			title: 'Home',
			icon: House,
			url: '/'
		},
		{
			title: 'Dashboard',
			icon: LayoutDashboard,
			url: '/dashboard',
			role: Role.GENERAL
		},
		{
			title: 'Borrow',
			icon: FolderOutput,
			url: '/borrow_onsite',
			role: Role.GENERAL
		},
		{
			title: 'Return',
			icon: FolderInput,
			url: '/return',
			role: Role.GENERAL
		},
		{
			title: 'Stock',
			icon: Archive,
			url: '/stock',
			role: Role.ADMIN
		},
		{
			title: 'Movement',
			icon: SendToBack,
			url: '/movement',
			role: Role.ADMIN,
			sub: [
				{
					title: 'Stock In',
					url: '/stock-in',
					role: Role.ADMIN
				},
				{
					title: 'Stock Out',
					url: '/stock-out',
					role: Role.ADMIN
				}
			]
		},
		{
			title: 'Active Borrowing',
			icon: Archive,
			url: '/active-borrowing',
			role: Role.ADMIN
		},
		{
			title: 'Config',
			icon: Settings,
			url: '/config',
			role: Role.SUPER
		}
	];

	beforeNavigate(() => (loadingPage = true));
	afterNavigate(() => (loadingPage = false));

	let currentRole = $derived(user ? user.role.toLowerCase() : undefined);
	let currentHash: string | undefined = $state();
	let currentPath: string | undefined = $state();

	$effect(() => {
		currentHash = page.url.hash;
		currentPath = page.url.pathname;
	});
</script>

<Toaster position="top-right" />
<ModeWatcher />
<div class="bg-secondary-foreground/5 relative isolate flex min-h-svh w-full max-lg:flex-col">
	<Navbar bind:currentHash bind:currentPath {sidebarMenu} {user} {currentRole} bind:openLoginDialog {logOut} />
	<NavbarSmall bind:currentHash bind:currentPath {sidebarMenu} {user} {currentRole} bind:openLoginDialog {logOut} />
	<main class="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pt-2 lg:pr-2 lg:pl-64">
		<LoginDialog bind:open={openLoginDialog} />
		<div class="bg-background text-foreground lg:ring-secondary-foreground/10 relative grow overflow-hidden p-6 lg:rounded-lg lg:p-10 lg:shadow-sm lg:ring-1">
			<div class="mx-auto max-w-6xl">
				{@render children?.()}
			</div>
			{#if isLogOut || loadingPage}
				<div transition:fade={{ duration: 200 }} class="bg-foreground/10 absolute inset-0 z-40 flex h-full w-full items-center justify-center backdrop-blur-sm">
					<LoaderCircle class="text-primary h-5 w-5 animate-spin" />
					<p class="ml-2 text-sm font-semibold tracking-wider">Loading...</p>
				</div>
			{/if}
		</div>
	</main>
</div>

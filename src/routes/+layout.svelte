<script lang="ts">
	import '../app.css';

	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { SendToBack, Archive, House, LoaderCircle, Settings, LayoutDashboard, FileText, Barcode, type IconProps } from '@lucide/svelte';
	import { Navbar, NavbarSmall, LoginDialog } from '$lib/components/layout';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { labelCartLength } from '$lib/labelCart.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	// type
	import type { Component } from 'svelte';
	import type { AuthRecord } from 'pocketbase';

	interface Props {
		data: { user: AuthRecord };
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	const { user } = $derived(data);

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

	type SideBarMenu = {
		title: string;
		icon: Component<IconProps, object, ''>;
		url: string;
		role?: string;
		sub?: {
			title: string;
			url: string;
			role: string;
		}[];
		notification?: number | string | object;
	};

	const sidebarMenu: SideBarMenu[] = [
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
		},
		{
			title: 'Report',
			icon: FileText,
			url: '/report',
			role: Role.SUPER
		},
		{
			title: 'Label',
			icon: Barcode,
			url: '/label',
			role: Role.SUPER,
			notification: labelCartLength
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
<div class="relative isolate flex min-h-svh w-full bg-secondary-foreground/5 max-lg:flex-col">
	<Navbar bind:currentHash bind:currentPath {sidebarMenu} {user} {currentRole} bind:openLoginDialog {logOut} />
	<NavbarSmall bind:currentHash bind:currentPath {sidebarMenu} {user} {currentRole} bind:openLoginDialog {logOut} />
	<main class="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pt-2 lg:pr-2 lg:pl-64">
		<LoginDialog bind:open={openLoginDialog} />
		<div class="relative grow overflow-hidden bg-background p-6 text-foreground lg:rounded-lg lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-secondary-foreground/10">
			<div class="mx-auto max-w-6xl">
				<Tooltip.Provider delayDuration={0}>
					{@render children?.()}
				</Tooltip.Provider>
			</div>
			{#if isLogOut || loadingPage}
				<div transition:fade={{ duration: 200 }} class="absolute inset-0 z-40 flex h-full w-full items-center justify-center bg-foreground/10 backdrop-blur-sm">
					<LoaderCircle class="h-5 w-5 animate-spin text-primary" />
					<p class="ml-2 text-sm font-semibold tracking-wider">Loading...</p>
				</div>
			{/if}
		</div>
	</main>
</div>

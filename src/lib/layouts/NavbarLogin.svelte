<script>
	import { Button } from '$lib/components/ui/button';
	import { LogIn } from 'lucide-svelte';

	export let openLoginDialog = false;
</script>

<span class="relative">
	<Button variant="ghost" on:click={() => (openLoginDialog = !openLoginDialog)} class="flex h-12 w-full items-center justify-start hover:bg-slate-200/70">
		<LogIn class="mr-2 h-4 w-4 max-lg:hidden" />
		<span class="truncate font-bold">Login</span>
	</Button>
</span>

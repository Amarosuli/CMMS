<script>
	import { Button } from '$lib/components/ui/button';
	import { LogIn } from 'lucide-svelte';

	/** @type {{openLoginDialog?: boolean}} */
	let { openLoginDialog = $bindable(false) } = $props();
</script>

<span class="relative">
	<Button variant="outline" onclick={() => (openLoginDialog = !openLoginDialog)} class="flex  w-full items-center justify-start ">
		<LogIn class="mr-2 h-4 w-4 max-lg:hidden" />
		<span class="truncate font-bold">Login</span>
	</Button>
</span>

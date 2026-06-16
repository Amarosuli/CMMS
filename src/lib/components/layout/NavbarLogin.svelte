<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { LogIn } from '@lucide/svelte';

	let { openLoginDialog = $bindable(false) }: { openLoginDialog: boolean } = $props();
</script>

<span class="relative">
	<Button variant="outline" onclick={() => (openLoginDialog = !openLoginDialog)} class="flex  w-full items-center justify-start ">
		<LogIn class="mr-2 h-4 w-4 max-lg:hidden" />
		<span class="truncate font-bold">Login</span>
	</Button>
</span>

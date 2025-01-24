<script lang="ts">
	import { ArrowUpDown } from 'lucide-svelte';
	import Button from '../ui/button/button.svelte';
	import type { ComponentProps } from 'svelte';

	let { variant = 'ghost', text = '', ...restProps }: ComponentProps<typeof Button> & { text?: string } = $props();
</script>

<Button {variant} {...restProps}>
	{text}
	<ArrowUpDown class="ml-2 size-4" />
</Button>

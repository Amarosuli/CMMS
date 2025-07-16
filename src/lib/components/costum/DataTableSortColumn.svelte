<script lang="ts">
	import { ArrowDown, ArrowUp } from '@lucide/svelte';
	import { Button } from '../ui/button';
	import type { ComponentProps } from 'svelte';

	let { variant = 'ghost', direction = undefined, text = '', ...restProps }: ComponentProps<typeof Button> & { text?: string; direction: 'asc' | 'dsc' | undefined } = $props();
	let show = $state(false);
</script>

<Button
	{variant}
	{...restProps}
	onhover={() => {
		show = true;
		console.log(show);
	}}
	class="group relative after:pr-[1.5rem]">
	{text}
	{#if direction === 'asc'}
		<ArrowUp class="absolute right-0 mr-2 size-4 text-primary" />
	{:else if direction === 'dsc'}
		<ArrowDown class="absolute right-0 mr-2 size-4 text-primary" />
	{/if}

	<ArrowDown data-slot="icon" class="absolute right-0 mr-2 hidden size-4 transition-all duration-100 ease-out {direction ? '' : 'group-hover:block'}" />
</Button>

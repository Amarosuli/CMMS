<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

	let { columnOption, value = $bindable() }: { columnOption: { label: string; value: string }[]; value: string } = $props();

	const triggerContent = $derived(columnOption.find((f) => f.value === value)?.label ?? 'Column');
</script>

<Select.Root type="single" name="column" bind:value>
	<Select.Trigger class="w-[180px]">
		{triggerContent}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each columnOption as column}
				<Select.Item value={column.value} label={column.label}>{column.label}</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>

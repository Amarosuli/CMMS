<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

	let { value = $bindable() }: { value: string } = $props();

	const operators = [
		{
			name: 'alike to',
			operator: '~'
		},
		{
			name: 'not like to',
			operator: '!~'
		},
		{
			name: 'equal to',
			operator: '='
		},
		{
			name: 'not equal to',
			operator: '!='
		}
	];

	const triggerContent = $derived(operators.find((f) => f.operator === value)?.name ?? 'Operator');
</script>

<Select.Root type="single" name="operator" bind:value>
	<Select.Trigger class="w-[180px]">
		{triggerContent}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each operators as operator}
				<Select.Item value={operator.operator} label={operator.name}>{operator.name}</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>

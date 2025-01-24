<script lang="ts">
	import * as Select from '$lib/components/ui/select';

	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { LoaderCircle } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	interface Props {
		data: any;
		currentView?: 'Edit' | 'Detail' | undefined;
		redirectUrl?: string | undefined;
		submitText?: string;
	}

	let { data, currentView = $bindable(undefined), redirectUrl = undefined, submitText = 'Update' }: Props = $props();

	const { materialUnit } = data;
	const form = superForm(data.form, {
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message);
				if (redirectUrl) goto(redirectUrl);
				currentView = 'Detail';
			}
		}
	});
	const { form: formData, delayed, message, enhance } = form;

	$effect(() => {
		data.materialMaster && formData.set(data.materialMaster);
	});

	let selectedUnit = $derived(
		$formData.unit_id
			? {
					label: materialUnit.find(({ value }: { value: string }) => value == $formData.unit_id)?.label,
					value: $formData.unit_id
				}
			: undefined
	);
</script>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Form Field</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" method="post" use:enhance>
		<Field {form} name="code">
			<Control>
				{#snippet children({ props })}
					<Label>Code</Label>
					<Input {...props} bind:value={$formData.code} type="text" placeholder="Material Code" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="description">
			<Control>
				{#snippet children({ props })}
					<Label>Description</Label>
					<Input {...props} bind:value={$formData.description} type="text" placeholder="Material Description" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="part_number">
			<Control>
				{#snippet children({ props })}
					<Label>Part Number</Label>
					<Input {...props} bind:value={$formData.part_number} type="text" placeholder="Part Number" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="minimum_quantity">
			<Control>
				{#snippet children({ props })}
					<Label>Minimum Quantity</Label>
					<Input {...props} bind:value={$formData.minimum_quantity} type="text" placeholder="Minimum Quantity" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="remark">
			<Control>
				{#snippet children({ props })}
					<Label>Remark</Label>
					<Input {...props} bind:value={$formData.remark} type="text" placeholder="Remark" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="unit_id">
			<Control>
				{#snippet children({ props })}
					<Label>Material Unit</Label>
					<Select.Root type="single" name={props.name} bind:value={$formData.unit_id}>
						<Select.Trigger {...props}>
							{selectedUnit?.label || 'Select Unit'}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each materialUnit as unit}
									<Select.Item value={unit.value} label={unit.label}>{unit.label}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Button class="mt-4" type="submit" disabled={$delayed ? true : false}>
			{#if $delayed}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Updating...
			{:else}
				{submitText}
			{/if}
		</Button>
		{#if $message}
			<p class="mt-2 bg-destructive p-2 text-center text-xs font-semibold text-destructive-foreground">{$message}</p>
		{/if}
	</form>
</div>

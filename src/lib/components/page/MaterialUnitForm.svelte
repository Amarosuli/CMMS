<script lang="ts">
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
		data.unit && formData.set(data.unit);
	});
</script>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Form Field</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" method="post" use:enhance>
		<Field {form} name="code">
			<Control>
				{#snippet children({ props })}
					<Label>Code</Label>
					<Input {...props} bind:value={$formData.code} type="text" placeholder="Unit Code" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="description">
			<Control>
				{#snippet children({ props })}
					<Label>Description</Label>
					<Input {...props} bind:value={$formData.description} type="text" placeholder="Unit Description" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Button class="mt-4" type="submit" disabled={$delayed ? true : false}>
			{#if $delayed}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Saving...
			{:else}
				{submitText}
			{/if}
		</Button>
		{#if $message}
			<p class="mt-2 bg-destructive p-2 text-center text-xs font-semibold text-destructive-foreground">{$message}</p>
		{/if}
	</form>
</div>

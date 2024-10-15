<script lang="ts">
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { LoaderCircle } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	export let data;
	export let currentView: 'Edit' | 'Detail' | undefined = undefined;
	export let redirectUrl: string | undefined = undefined;
	export let submitText: string = 'Update';

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
	$: data.unit && formData.set(data.unit);
</script>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Form Field</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" method="post" use:enhance>
		<Field {form} name="code">
			<Control let:attrs>
				<Label>Code</Label>
				<Input {...attrs} bind:value={$formData.code} type="text" placeholder="Unit Code" />
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="description">
			<Control let:attrs>
				<Label>Description</Label>
				<Input {...attrs} bind:value={$formData.description} type="text" placeholder="Unit Description" />
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

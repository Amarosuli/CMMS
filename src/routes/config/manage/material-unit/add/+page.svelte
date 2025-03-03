<script lang="ts">
	import { ChevronLeft, CalendarPlus, LoaderCircle } from 'lucide-svelte';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { time } from '$lib/helpers.js';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';

	let { data } = $props();

	const form = superForm(data.form, {
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message);
				goto(backUrl);
			}
		}
	});

	const { form: formData, delayed, message, enhance } = form;

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');
</script>

<svelte:head>
	<title>CMMS - Add Material Unit</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Material Unit</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Add <span class="text-foreground/50">Material Unit</span></h1>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
	</div>
</div>

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
				Save
			{/if}
		</Button>
		{#if $message}
			<p class="mt-2 bg-destructive p-2 text-center text-xs font-semibold text-destructive-foreground">{$message}</p>
		{/if}
	</form>
</div>

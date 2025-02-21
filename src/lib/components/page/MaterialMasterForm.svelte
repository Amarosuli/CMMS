<script lang="ts">
	import * as Select from '$lib/components/ui/select';

	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { fileProxy, filesProxy, superForm } from 'sveltekit-superforms';
	import { goto, invalidateAll } from '$app/navigation';
	import { LoaderCircle, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { pb } from '$lib/pocketbaseClient';

	interface Props {
		data: any;
		currentView?: 'Edit' | 'Detail' | undefined;
		redirectUrl?: string | undefined;
		submitText?: string;
	}

	let { data = $bindable(), currentView = $bindable(undefined), redirectUrl = undefined, submitText = 'Update' }: Props = $props();

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
	const pdfFiles = fileProxy(formData, 'sds');
	const imgFiles = filesProxy(formData, 'images');

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

	function removeImage(id: string, name: string) {
		const promise = pb
			.collection('material_master')
			.update(id, {
				'images-': [name]
			})
			.then(() => {
				invalidateAll();
				currentView = 'Detail';
			});

		toast.promise(promise, {
			loading: 'remove image...',
			success: 'image has been removed',
			error: 'remove error, try again!'
		});
	}
	function removeSDS(id: string, name: string) {
		const promise = pb
			.collection('material_master')
			.update(id, {
				'sds-': [name]
			})
			.then(() => {
				invalidateAll();
				currentView = 'Detail';
			});

		toast.promise(promise, {
			loading: 'remove sds...',
			success: 'sds has been removed',
			error: 'remove error, try again!'
		});
	}
</script>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Form Field</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" method="post" enctype="multipart/form-data" use:enhance>
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
		<Field {form} name="images">
			<Control>
				{#snippet children({ props })}
					<Label>Images <span class="italic text-foreground/70">*PNG or JPG</span></Label>
					<div class="flex flex-col divide-y">
						{#each $formData.images as img}
							<div class="flex items-center justify-between gap-2 px-2">
								<span class="truncate italic text-destructive">
									{img}
								</span>
								<Button variant="icon" onclick={() => removeImage($formData.id, img)}>
									<X class="size-4" />
								</Button>
							</div>
						{/each}
					</div>
					<Input {...props} bind:files={$imgFiles} multiple accept="image/png, image/jpeg" type="file" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="sds">
			<Control>
				{#snippet children({ props })}
					<Label>Safety Data Sheet <span class="italic text-foreground/70">*PDF Only</span></Label>
					{#if $formData.sds}
						<div class="flex items-center justify-between gap-2 px-2">
							<span class="truncate italic text-destructive">
								{$formData.sds}
							</span>
							<Button variant="icon" onclick={() => removeSDS($formData.id, $formData.sds)}>
								<X class="size-4" />
							</Button>
						</div>
					{/if}
					<Input {...props} bind:files={$pdfFiles} accept="application/pdf" type="file" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="url_refference">
			<Control>
				{#snippet children({ props })}
					<Label>URL Refference</Label>
					<Input {...props} bind:value={$formData.url_refference} type="text" placeholder="URL Refference" />
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

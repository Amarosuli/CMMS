<script lang="ts">
	import * as Select from '$lib/components/ui/select';

	import { fileProxy, filesProxy, superForm } from 'sveltekit-superforms';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { ChevronLeft, CalendarPlus } from '@lucide/svelte';
	import { LoaderCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers.js';
	import { page } from '$app/state';

	let { data } = $props();

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');
	let redirectUrl = backUrl;

	const { materialUnitOption, materialTypeOption } = data;
	const form = superForm(data.form, {
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message);
				if (redirectUrl) goto(redirectUrl);
			}
		}
	});
	const { form: formData, errors, delayed, message, enhance } = form;
	const pdfFiles = fileProxy(formData, 'sds');
	const imgFiles = filesProxy(formData, 'images');

	let selectedUnit = $derived(
		$formData.material_unit_id
			? {
					label: materialUnitOption.find(({ value }: { value: string }) => value == $formData.material_unit_id)?.label,
					value: $formData.material_unit_id
				}
			: undefined
	);

	let selectedType = $derived(
		$formData.material_type_id
			? {
					label: materialTypeOption.find(({ value }: { value: string }) => value == $formData.material_type_id)?.label,
					value: $formData.material_type_id
				}
			: undefined
	);

	let selectedPDF: string = $state('');
	let selectedImages: string = $state('');
</script>

<svelte:head>
	<title>CMMS - Add Material Master</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>Material Master</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Add <span class="text-foreground/50">Material Master</span></h1>
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
	<h2 class="text-foreground text-base/7 font-semibold sm:text-sm/6">Form Field</h2>
	<hr role="presentation" class="border-foreground/10 mt-4 w-full border-t" />

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
		<Field {form} name="material_unit_id">
			<Control>
				{#snippet children({ props })}
					<Label>Material Unit</Label>
					<Select.Root type="single" name={props.name} bind:value={$formData.material_unit_id}>
						<Select.Trigger {...props}>
							{selectedUnit?.label || 'Select Unit'}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each materialUnitOption as unit}
									<Select.Item value={unit.value} label={unit.label}>{unit.label}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="material_type_id">
			<Control>
				{#snippet children({ props })}
					<Label>Material Type</Label>
					<Select.Root type="single" name={props.name} bind:value={$formData.material_type_id}>
						<Select.Trigger {...props}>
							{selectedType?.label || 'Select Type'}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each materialTypeOption as type}
									<Select.Item value={type.value} label={type.label}>{type.label}</Select.Item>
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
					<Label>Images <span class="text-foreground/70 italic">*PNG or JPG</span></Label>

					<input
						{...props}
						bind:files={$imgFiles}
						multiple
						accept="image/png, image/jpeg"
						type="file"
						hidden
						onchange={(e) => {
							let file = e.currentTarget.files;
							if (file == null) return;
							selectedImages = file.length == 1 ? file.length + ' Image Selected' : file.length + ' Images Selected';
						}} />
					<Label
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full cursor-pointer rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
						>{selectedImages ? selectedImages : 'Add Image'}</Label>
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="sds">
			<Control>
				{#snippet children({ props })}
					<Label>Safety Data Sheet <span class="text-foreground/70 italic">*PDF Only</span></Label>

					<input
						{...props}
						bind:files={$pdfFiles}
						accept="application/pdf"
						onchange={(e) => {
							let file = e.currentTarget.files;
							if (file == null) return;
							selectedPDF = file[0].name;
						}}
						type="file"
						hidden />
					<Label
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full cursor-pointer rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
						>{selectedPDF ? selectedPDF : 'Add SDS'}</Label>
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="url_reference">
			<Control>
				{#snippet children({ props })}
					<Label>URL Refference</Label>
					<Input {...props} bind:value={$formData.url_reference} type="text" placeholder="URL Reference" />
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
			<p class="bg-destructive text-destructive-foreground mt-2 p-2 text-center text-xs font-semibold">{$message}</p>
		{/if}
	</form>
</div>

<script lang="ts">
	import * as Select from '$lib/components/ui/select';

	import { LoaderCircle, ChevronLeft, CalendarPlus } from '@lucide/svelte';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { UserRole, UserUnit } from '$lib/CostumTypes.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { goto } from '$app/navigation';
	import { time } from '$lib/helpers.js';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';

	let { data } = $props();
	let { userData } = data;

	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');

	const form = superForm(data.form, {
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message);
				goto(backUrl);
			}
		}
	});
	const { form: formData, delayed, message, enhance } = form;

	let units = (Object.keys(UserUnit) as Array<keyof typeof UserUnit>).map((v) => {
		return { label: v, value: UserUnit[v] };
	});

	let roles = (Object.keys(UserRole) as Array<keyof typeof UserRole>).map((v) => {
		return { label: v, value: UserRole[v] };
	});

	let selectedUnit = $derived(
		$formData.unit
			? {
					label: units.find(({ value }: { value: string }) => value == $formData.unit)?.label,
					value: $formData.unit
				}
			: undefined
	);

	let selectedRole = $derived(
		$formData.role
			? {
					label: roles.find(({ value }: { value: string }) => value == $formData.role)?.label,
					value: $formData.role
				}
			: undefined
	);

	$effect(() => {
		if (userData) {
			formData.set({
				...userData
			});
		}
	});
</script>

<svelte:head>
	<title>CMMS - Edit User</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>User Management</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Edit <span class="text-foreground/50">User</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(data.userData?.created)}</span></span>
		</div>
		<div class="flex gap-4">
			<Button variant="outline" onclick={() => goto(backUrl)} class="min-w-20 ">Detail</Button>
		</div>
	</div>
</div>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Form Field</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<form class="mt-3 flex w-full max-w-80 flex-col text-base/6 sm:text-sm/6" method="post" use:enhance>
		<Field {form} name="username">
			<Control>
				{#snippet children({ props })}
					<Label>Username or Employee Id</Label>
					<Input {...props} bind:value={$formData.username} type="text" placeholder="Username or Employee Id" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="email">
			<Control>
				{#snippet children({ props })}
					<Label>Email</Label>
					<Input {...props} bind:value={$formData.email} type="text" placeholder="....@gmf-aeroasia.co.id" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="name">
			<Control>
				{#snippet children({ props })}
					<Label>Name</Label>
					<Input {...props} bind:value={$formData.name} type="text" placeholder="Your name" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="unit">
			<Control>
				{#snippet children({ props })}
					<Label>Unit</Label>
					<Select.Root type="single" name={props.name} bind:value={$formData.unit}>
						<Select.Trigger {...props}>
							{selectedUnit?.label || 'Select Unit'}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each units as unit}
									<Select.Item value={unit.value} label={unit.label}>{unit.label}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="role">
			<Control>
				{#snippet children({ props })}
					<Label>Role</Label>
					<Select.Root type="single" name={props.name} bind:value={$formData.role}>
						<Select.Trigger {...props}>
							{selectedRole?.label || 'Select role'}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each roles as role}
									<Select.Item value={role.value} label={role.label}>{role.label}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<!-- <Field {form} name="password">
			<Control>
				{#snippet children({ props })}
					<Label>Password</Label>
					<Input class="" {...props} bind:value={$formData.password} type="password" autocomplete={null} placeholder="Your Password" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field>
		<Field {form} name="passwordConfirm">
			<Control>
				{#snippet children({ props })}
					<Label>Password Confirm</Label>
					<Input class="" {...props} bind:value={$formData.passwordConfirm} type="password" autocomplete={null} placeholder="Your Password" />
				{/snippet}
			</Control>
			<FieldErrors class="text-xs italic" />
		</Field> -->
		<Button class="mt-4" type="submit" disabled={$delayed ? true : false}>
			{#if $delayed}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Updating...
			{:else}
				Update
			{/if}
		</Button>
		{#if $message}
			<p class="mt-2 bg-destructive p-2 text-center text-xs font-semibold text-destructive-foreground">{$message}</p>
		{/if}
	</form>
</div>

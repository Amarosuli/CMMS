<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { loginSchema } from '$lib/zodSchema';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { zod } from 'sveltekit-superforms/adapters';
	// icons
	import { LoaderCircle } from 'lucide-svelte';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	let errorMessage = $state('');

	const form = superForm(defaults(zod(loginSchema)), {
		SPA: true,
		validators: zod(loginSchema),
		resetForm: false,
		onChange() {
			errorMessage = '';
		},
		async onUpdate({ form }) {
			if (form.valid) {
				const response = await fetch('/auth', {
					method: 'POST',
					body: JSON.stringify(form.data),
					headers: {
						'Content-Type': 'application/json'
					}
				});
				const { message, status } = await response.json();
				if (status === 400) {
					errorMessage = message;
					toast.error('Authentication Error');
				} else if (status === 200) location.reload();
			}
		}
	});
	const { form: formData, delayed, enhance, reset } = form;

	$effect(() => {
		if (open) {
			reset();
			errorMessage = '';
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Login</Dialog.Title>
			<Dialog.Description>Utilize your power now!</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex w-full flex-col gap-4">
			<form class="flex w-full flex-col" method="post" use:enhance>
				<Field {form} name="employeeId">
					<Control>
						{#snippet children({ props })}
							<Label>Employee ID</Label>
							<Input class="" {...props} bind:value={$formData.employeeId} type="text" placeholder="Your Employee ID" />
						{/snippet}
					</Control>
					<FieldErrors class="text-xs italic" />
				</Field>
				<Field {form} name="password">
					<Control>
						{#snippet children({ props })}
							<Label>Password</Label>
							<Input class="" {...props} bind:value={$formData.password} type="password" autocomplete={null} placeholder="Your Password" />
						{/snippet}
					</Control>
					<FieldErrors class="text-xs italic" />
				</Field>
				<Button class="mt-4" type="submit" disabled={$delayed ? true : false}>
					{#if $delayed}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin " />
						Authenting...
					{:else}
						Let's go!
					{/if}
				</Button>
				{#if errorMessage}
					<p class="mt-2 bg-destructive/50 p-2 text-center text-xs font-semibold text-destructive-foreground">{errorMessage}</p>
				{/if}
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

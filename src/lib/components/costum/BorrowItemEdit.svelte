<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { loginSchema } from '$lib/zodSchema';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input';
	import { zod } from 'sveltekit-superforms/adapters';
	// icons
	import { LoaderCircle } from 'lucide-svelte';

	export let open: boolean = false;
	export let item;

	const form = superForm(defaults(zod(loginSchema)), {
		SPA: true,
		validators: zod(loginSchema),
		async onUpdate({ form }) {
			if (form.valid) {
				const response = await fetch('/auth', {
					method: 'POST',
					body: JSON.stringify(form.data),
					headers: {
						'Content-Type': 'application/json'
					}
				});
				const { message } = await response.json();
				if (message === 'success') location.reload();
			}
		},
		onUpdated({ form }) {
			if (form.valid) {
				open = !open;
			}
		}
	});
	const { form: formData, validateForm, delayed, message, enhance } = form;
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
					<Control let:attrs>
						<Label>Employee ID</Label>
						<Input class="" {...attrs} bind:value={$formData.employeeId} type="text" placeholder="Your Employee ID" />
					</Control>
					<FieldErrors class="text-xs italic" />
				</Field>
				<Field {form} name="password">
					<Control let:attrs>
						<Label>Password</Label>
						<Input class="" {...attrs} bind:value={$formData.password} type="password" autocomplete="false" placeholder="Your Password" />
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
				{#if $message}
					<p class="mt-2 bg-destructive p-2 text-center text-xs font-semibold text-destructive-foreground">{$message}</p>
				{/if}
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

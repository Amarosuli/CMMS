<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { LoaderCircle } from '@lucide/svelte';
	import { LoginSchema } from '$lib/valibotSchema';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button/index.js';
	import { logIn } from '$lib/remote-function/auth.remote';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	const form = superForm(defaults(valibot(LoginSchema)), {
		id: 'login',
		SPA: true,
		validators: valibot(LoginSchema),
		resetForm: false,
		async onUpdate({ form }) {
			if (form.valid) {
				logIn(form.data).then(({ status, message }) => {
					if (status === 'failed') {
						toast.error(`Authentication error ${message}`);
					} else {
						toast.success(message);
						location.reload();
						open = false;
						reset();
					}
				});
			}
		}
	});
	const { form: formData, delayed, enhance, reset } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Content onInteractOutside={(e) => e.preventDefault()} class="p-10">
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
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

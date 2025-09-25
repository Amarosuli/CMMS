<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { ChevronLeft, CalendarPlus, TriangleAlert, LoaderCircle } from '@lucide/svelte';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { ChangePasswordSchema } from '$lib/valibotSchema.js';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { changePassword } from '../user-management.remote.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { time } from '$lib/helpers.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { pb } from '$lib/pocketbaseClient.js';

	let { data } = $props();

	let errorMessage = $state('');
	const form = superForm(defaults(valibot(ChangePasswordSchema)), {
		SPA: true,
		validators: valibot(ChangePasswordSchema),
		resetForm: true,
		onChange() {
			errorMessage = '';
		},
		async onUpdate({ form }) {
			if (form.valid) {
				const { status } = await changePassword(form.data);

				if (status === 'failed') {
					toast.error('Change password error');
				} else {
					toast.success('Password changed successfully!');
					changePasswordDialogOpen = false;
				}
			}
		}
	});
	const { form: formData, delayed, enhance } = form;

	function deleteUser() {
		deleteLoading = true;
		pb.authStore.save(data.token, data.model);
		pb.collection('users')
			.delete(data.id)
			.then(() => {
				toast.info('User deleted');
				goto(backUrl);
			})
			.catch((error) => {
				toast.error('Delete user error: ' + error.message);
			})
			.finally(() => {
				confirmDialogOpen = false;
				deleteLoading = false;
			});
	}

	let deleteLoading = $state(false);
	let backUrl = page.url.pathname.replace(/\/[^/]*$/, '');
	let confirmDialogOpen = $state(false);
	let changePasswordDialogOpen = $state(false);
</script>

<svelte:head>
	<title>CMMS - Detail User</title>
</svelte:head>

<div>
	<Button href={backUrl} variant="outline" class="inline-flex items-center gap-2 text-sm/6">
		<ChevronLeft class="h-4 w-4" />
		<span>User Management</span>
	</Button>
</div>

<div class="mt-4 lg:mt-8">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl/8 font-semibold sm:text-xl/8">Detail <span class="text-foreground/50">User</span></h1>
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 sm:text-xs/5 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(new Date())}</span></span>
		</div>
		<div class="flex gap-4">
			<Button variant="outline" onclick={() => goto(page.url.pathname + '/edit')} class="min-w-20 ">Edit</Button>
			<Button variant="outline" onclick={() => (changePasswordDialogOpen = true)} class="min-w-20 ">Change Password</Button>
			<Button variant="outline" onclick={() => (confirmDialogOpen = true)} class="border-destructive text-destructive hover:text-destructive min-w-20 font-semibold">Delete User <TriangleAlert class="size-4" /></Button>
		</div>
	</div>
</div>

{#if data.userData.data}
	<div class="mt-12">
		<h2 class="text-foreground text-base/7 font-semibold sm:text-sm/6">Detail of User</h2>
		<hr role="presentation" class="border-foreground/10 mt-4 w-full border-t" />
		<dl class="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6">
			<dt class="border-foreground/5 text-foreground/50 col-start-1 border-t pt-3 first:border-none sm:py-3">Username / Employee Id</dt>
			<dd class="text-foreground sm:border-foreground/5 pt-1 pb-3 sm:border-t sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.data.username}</dd>
			<dt class="border-foreground/5 text-foreground/50 col-start-1 border-t pt-3 first:border-none sm:py-3">Name</dt>
			<dd class="text-foreground sm:border-foreground/5 pt-1 pb-3 capitalize sm:border-t sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.data.name.toLowerCase()}</dd>
			<dt class="border-foreground/5 text-foreground/50 col-start-1 border-t pt-3 first:border-none sm:py-3">Email</dt>
			<dd class="text-foreground sm:border-foreground/5 pt-1 pb-3 sm:border-t sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.data.email || '-'}</dd>
			<dt class="border-foreground/5 text-foreground/50 col-start-1 border-t pt-3 first:border-none sm:py-3">Unit</dt>
			<dd class="text-foreground sm:border-foreground/5 pt-1 pb-3 sm:border-t sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.data.unit}</dd>
			<dt class="border-foreground/5 text-foreground/50 col-start-1 border-t pt-3 first:border-none sm:py-3">Role</dt>
			<dd class="text-foreground sm:border-foreground/5 pt-1 pb-3 sm:border-t sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.data.role}</dd>
		</dl>
	</div>
{/if}

<AlertDialog.Root bind:open={confirmDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>This action cannot be undone. This will permanently delete user.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={deleteUser}>{deleteLoading ? 'Deleting..' : 'Delete'}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root bind:open={changePasswordDialogOpen}>
	<Dialog.Content onInteractOutside={(e: Event) => e.preventDefault()} class="p-10">
		<Dialog.Header>
			<Dialog.Title>Change Password</Dialog.Title>
			<Dialog.Description>Focus! You have type your password correctly!</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex w-full flex-col gap-4">
			<form class="flex w-full flex-col" method="post" use:enhance>
				<Field {form} name="password">
					<Control>
						{#snippet children({ props })}
							<Label>New Password</Label>
							<Input class="" {...props} bind:value={$formData.password} type="text" placeholder="Your New Password" />
						{/snippet}
					</Control>
					<FieldErrors class="text-xs italic" />
				</Field>
				<Field {form} name="passwordConfirm">
					<Control>
						{#snippet children({ props })}
							<Label>Confirm New Password</Label>
							<Input class="" {...props} bind:value={$formData.passwordConfirm} type="password" autocomplete={null} placeholder="Confirm New Password" />
						{/snippet}
					</Control>
					<FieldErrors class="text-xs italic" />
				</Field>
				<Button class="mt-4" type="submit" disabled={$delayed ? true : false}>
					{#if $delayed}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin " />
						Updating...
					{:else}
						Update
					{/if}
				</Button>
				{#if errorMessage}
					<p class="bg-destructive/50 text-destructive-foreground mt-2 p-2 text-center text-xs font-semibold">{errorMessage}</p>
				{/if}
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

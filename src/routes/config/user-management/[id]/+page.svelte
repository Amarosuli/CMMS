<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { ChevronLeft, CalendarPlus, TriangleAlert, LoaderCircle } from '@lucide/svelte';
	import { FieldErrors, Control, Field, Label } from '$lib/components/ui/form';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { time } from '$lib/helpers.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { zod } from 'sveltekit-superforms/adapters';
	import { pb } from '$lib/pocketbaseClient.js';
	import { z } from 'zod';

	let { data } = $props();

	const changePasswordSchema = z.object({
		newPassword: z.string().min(8, 'Minimal 8 Characters'),
		confirmNewPassword: z.string().min(8, 'Minimal 8 Characters')
	});
	let errorMessage = $state('');
	const form = superForm(defaults(zod(changePasswordSchema)), {
		SPA: true,
		validators: zod(changePasswordSchema),
		resetForm: true,
		onChange() {
			errorMessage = '';
		},
		async onUpdate({ form }) {
			if (form.valid) {
				return toast.info('This feature currently not available..');
				pb.authStore.save(data.token, data.model); // it keeps saying that token cannot be blank.
				pb.collection('users')
					.confirmPasswordReset('', form.data.newPassword, form.data.confirmNewPassword)
					.then((res) => {
						changePasswordDialogOpen = false;
						toast.success('Password changed successfully!');
					})
					.catch((error) => {
						errorMessage = error.message;
						toast.error('Change password error');
					});
			}
		}
	});
	const { form: formData, delayed, enhance, reset } = form;

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
		<span class="inline-flex items-center gap-x-1.5 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-sm/5 font-medium text-lime-700 group-data-[hover]:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-[hover]:bg-lime-400/15 sm:text-xs/5 forced-colors:outline">{data.id}</span>
	</div>
	<div class="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
		<div class="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
			<span class="flex items-center gap-3 text-base/6 sm:text-sm/6">
				<CalendarPlus class="h-4 w-4" />
				<span>{time(data.userData?.created)}</span></span>
		</div>
		<div class="flex gap-4">
			<Button variant="outline" onclick={() => goto(page.url.pathname + '/edit')} class="min-w-20 ">Edit</Button>
			<Button variant="outline" onclick={() => (changePasswordDialogOpen = true)} class="min-w-20 ">Change Password</Button>
			<Button variant="outline" onclick={() => (confirmDialogOpen = true)} class="min-w-20 border-destructive font-semibold text-destructive hover:text-destructive">Delete User <TriangleAlert class="size-4" /></Button>
		</div>
	</div>
</div>

<div class="mt-12">
	<h2 class="text-base/7 font-semibold text-foreground sm:text-sm/6">Detail of User</h2>
	<hr role="presentation" class="mt-4 w-full border-t border-foreground/10" />
	<dl class="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6">
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Username / Employee Id</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.username}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Name</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.name}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Email</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.email || '-'}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Unit</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.unit}</dd>
		<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Role</dt>
		<dd class="pb-3 pt-1 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:[&:nth-child(2)]:border-none">{data.userData.role}</dd>
	</dl>
</div>

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
	<Dialog.Content onInteractOutside={(e) => e.preventDefault()} class="p-10">
		<Dialog.Header>
			<Dialog.Title>Change Password</Dialog.Title>
			<Dialog.Description>Focus! You have type your password correctly!</Dialog.Description>
		</Dialog.Header>
		<div class="mt-6 flex w-full flex-col gap-4">
			<form class="flex w-full flex-col" method="post" use:enhance>
				<Field {form} name="newPassword">
					<Control>
						{#snippet children({ props })}
							<Label>New Password</Label>
							<Input class="" {...props} bind:value={$formData.newPassword} type="text" placeholder="Your New Password" />
						{/snippet}
					</Control>
					<FieldErrors class="text-xs italic" />
				</Field>
				<Field {form} name="confirmNewPassword">
					<Control>
						{#snippet children({ props })}
							<Label>Confirm New Password</Label>
							<Input class="" {...props} bind:value={$formData.confirmNewPassword} type="password" autocomplete={null} placeholder="Confirm New Password" />
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
					<p class="mt-2 bg-destructive/50 p-2 text-center text-xs font-semibold text-destructive-foreground">{errorMessage}</p>
				{/if}
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>

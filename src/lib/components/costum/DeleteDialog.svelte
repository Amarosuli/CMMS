<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { applyAction, deserialize } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	interface Props {
		id: string;
		open?: boolean;
		reload?: () => void;
	}

	let { id, open = $bindable(false), reload = () => {} }: Props = $props();
	let isLoading = $state(false);

	async function handleDelete(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		isLoading = true;
		event.preventDefault();

		const data = new FormData(event.currentTarget);

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});

		const result = deserialize(await response.text());

		if (result.type === 'success') {
			if (result.data?.message) toast.success(result.data?.message as string);
			open = false;
			reload();
			isLoading = false;
		}

		if (result.type === 'failure') {
			if (result.data?.message) toast.error(result.data?.message as string);
			open = false;
			isLoading = false;
		}

		applyAction(result);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>Delete</Dialog.Title>
			<Dialog.Description>Are you sure ?</Dialog.Description>
		</Dialog.Header>
		<form action="?/delete" method="post" onsubmit={handleDelete}>
			<input name="id" type="text" hidden value={id} />
			<div class="flex justify-between gap-4">
				<Button type="submit" class="flex w-full  justify-center p-2 text-center">{isLoading ? 'Deleting...' : 'Yes'}</Button>
				<Button onclick={() => (open = false)} variant="outline" class="flex w-full  justify-center p-2 text-center">Cancel</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { applyAction, deserialize } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	interface Props {
		id: string;
		reload?: Function;
		open?: boolean;
	}

	let { id, reload = () => {}, open = $bindable(false) }: Props = $props();

	async function handleDelete(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();

		const data = new FormData(event.currentTarget);

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});

		const result = deserialize(await response.text());

		if (result.type === 'success') {
			if (result.data?.message) toast.success(result.data?.message as string);
			reload();
		}

		if (result.type === 'failure') {
			if (result.data?.message) toast.error(result.data?.message as string);
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
		<!-- <div class="mt-6 flex w-full flex-col gap-4"> -->
		<form action="?/delete" method="post" onsubmit={handleDelete}>
			<input name="id" type="text" hidden value={id} />
			<div class="flex justify-between gap-4">
				<Button type="submit" class="flex w-full  justify-center p-2 text-center">Yes</Button>
				<Button onclick={() => (open = false)} variant="outline" class="flex w-full  justify-center p-2 text-center">Cancel</Button>
			</div>
		</form>
		<!-- </div> -->
	</Dialog.Content>
</Dialog.Root>

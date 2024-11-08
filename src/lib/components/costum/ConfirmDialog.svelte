<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function onCancel() {
		dispatch('cancel');
		open = false;
	}

	function onConfirm() {
		dispatch('confirm');
		open = false;
	}

	export let open = false;
	export let title: string = 'Confirmation';
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>Are you sure ?</Dialog.Description>
		</Dialog.Header>

		<div class="flex justify-between gap-4">
			<Button type="submit" class="flex w-full  justify-center p-2 text-center" on:click={onConfirm}>Yes</Button>
			<Button
				on:click={() => {
					onCancel();
					open = false;
				}}
				variant="outline"
				class="flex w-full  justify-center p-2 text-center">Cancel</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';

	let { open = $bindable(false), title = 'Confirmation', onConfirm = () => {}, onCancel = () => {} } = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="p-10">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>Are you sure ?</Dialog.Description>
		</Dialog.Header>

		<div class="flex w-fit justify-between gap-4">
			<Button
				type="submit"
				class="flex w-full  justify-center p-2 text-center"
				onclick={() => {
					onConfirm();
					open = false;
				}}>Yes</Button>
			<Button
				onclick={() => {
					onCancel();
					open = false;
				}}
				variant="outline"
				class="flex w-full  justify-center p-2 text-center">Cancel</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

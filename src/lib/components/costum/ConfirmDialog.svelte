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

		<div class="relative flex w-full justify-around gap-2">
			<Button
				size="lg"
				type="submit"
				class="w-1/2 justify-center p-2 text-center"
				onclick={() => {
					onConfirm();
					open = false;
				}}>Yes</Button>
			<Button
				size="lg"
				onclick={() => {
					onCancel();
					open = false;
				}}
				variant="outline"
				class="w-1/2 justify-center p-2 text-center">Cancel</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { applyAction, deserialize } from '$app/forms';
	import { DeleteDialog } from './';
	import { Ellipsis } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	import type { AuthModel } from 'pocketbase';

	export let id: string;
	export let user: AuthModel | undefined;
	export let basePath: string;
	export let reload: Function = () => {};
	export let disableDelete: boolean = false;

	let open = false;

	async function handleDelete(event: any) {
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

<DeleteDialog {id} {reload} bind:open />

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item
				on:click={async () => {
					try {
						await navigator.clipboard.writeText(id);
						toast.success('The Data ID was copied to your clipboard!');
					} catch (_) {
						toast.error('Failed to copy ID');
					}
				}}>Copy Data ID</DropdownMenu.Item>
		</DropdownMenu.Group>
		{#if user}
			<DropdownMenu.Separator />
			<DropdownMenu.Item href="{basePath}/{id}">Detail</DropdownMenu.Item>
			<DropdownMenu.Item href="{basePath}/{id}#edit">Edit</DropdownMenu.Item>
			{#if !disableDelete}
				<DropdownMenu.Item on:click={() => (open = true)}>Delete</DropdownMenu.Item>
			{/if}
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>

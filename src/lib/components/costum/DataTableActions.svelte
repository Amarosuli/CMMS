<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { DeleteDialog } from './';
	import { Ellipsis } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	import type { AuthModel } from 'pocketbase';

	interface Props {
		id: string;
		user: AuthModel | undefined;
		reload?: () => void;
		basePath: string;
		disableDelete?: boolean;
	}

	let { id, user, reload, basePath, disableDelete = false }: Props = $props();

	let open = $state(false);
</script>

<DeleteDialog {id} {reload} bind:open />

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" {...props} size="icon" class="relative h-8 w-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="h-4 w-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item
				onclick={async () => {
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
			<DropdownMenu.Item onclick={() => goto(`${basePath}/${id}`)}>Detail</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => goto(`${basePath}/${id}/edit`)}>Edit</DropdownMenu.Item>
			{#if !disableDelete}
				<DropdownMenu.Item onclick={() => (open = true)}>Delete</DropdownMenu.Item>
			{/if}
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>

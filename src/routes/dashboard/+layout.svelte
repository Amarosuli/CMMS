<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { LayoutDashboard, List, Plus } from '@lucide/svelte';

	interface Props {
		data: any;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
</script>

<div class="h-full w-full">
	<div class="flex w-full gap-3">
		<Button href="/dashboard" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
			<LayoutDashboard class="h-4 w-4" />
			<span>Dashboard</span>
		</Button>
		<Button href="/dashboard/list-transaction" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
			<List class="h-4 w-4" />
			<span>List Transaction</span>
		</Button>
		<Button href="/dashboard/new-transaction" variant="outline" class="inline-flex items-center gap-2 text-sm/6">
			<Plus class="h-4 w-4" />
			<span>New Transaction</span>
		</Button>
	</div>
	{@render children?.()}
</div>

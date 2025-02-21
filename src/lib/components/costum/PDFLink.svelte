<script lang="ts">
	import { getFileUrl } from '$lib/pocketbaseClient';
	import { Button } from '../ui/button';

	let { id, name }: { id: string; name: string } = $props();
	let url = getFileUrl('material_master', id, name);
</script>

<Button variant="link" href={url} target="_blank" class="p-0">{name}</Button>

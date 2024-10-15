<script lang="ts">
	import { page } from '$app/stores';
	import { MaterialUnit } from '$lib/components/page';

	export let data;
	const { user } = data;

	const basePath = $page.url.pathname;
</script>

<svelte:head>
	<title>CMMS - Material Unit</title>
</svelte:head>

<MaterialUnit {user} {basePath} tableName="Material Unit" />

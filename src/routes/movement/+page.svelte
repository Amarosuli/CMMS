<script lang="ts">
	import { Movement } from '$lib/components/page';
	import { page } from '$app/stores';

	export let data;
	const { user } = data;

	const basePath = $page.url.pathname;
</script>

<svelte:head>
	<title>CMMS - Movement</title>
</svelte:head>

<Movement {user} {basePath} tableName="Stock Movement" />

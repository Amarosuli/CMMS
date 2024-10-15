<script lang="ts">
	import { StockAvailable } from '$lib/components/page';
	import { page } from '$app/stores';

	export let data;
	const { user } = data;

	const basePath = $page.url.pathname;
</script>

<svelte:head>
	<title>CMMS - Stock Available</title>
</svelte:head>

<StockAvailable {user} {basePath} tableName="Stock Available" />

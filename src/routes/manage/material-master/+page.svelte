<script lang="ts">
	import { page } from '$app/stores';
	import { MaterialMaster } from '$lib/components/page';

	export let data;
	const { user } = data;

	const basePath = $page.url.pathname;
</script>

<MaterialMaster {user} {basePath} tableName="Material Master" />

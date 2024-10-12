<script lang="ts">
	import { MaterialMasterPreview, MaterialUnitPreview } from '$lib/layouts/pages';
	import { Render, createRender } from 'svelte-headless-table';
	import { page } from '$app/stores';

	export let data;
	const { user } = data;

	const basePath = $page.url.pathname;

	let subPages = [
		{
			hash: '#material-master',
			title: 'Material Master',
			render: createRender(MaterialMasterPreview, { user, basePath, tableName: 'Material Master' })
		},
		{
			hash: '#material-unit',
			title: 'Material Unit',
			render: createRender(MaterialUnitPreview, { user, basePath, tableName: 'Material Unit' })
		},
		{
			hash: '#transaction-type',
			title: 'Transaction Type',
			render: createRender(MaterialUnitPreview, { user, basePath, tableName: 'Material Unit' })
		}
	];

	let activeSubPage = subPages[0];

	$: subPages.forEach((page) => {
		if (page.hash === $page.url.hash) {
			activeSubPage = page;
		}
	});
</script>

<svelte:head>
	<title>CMMS - {activeSubPage.title}</title>
</svelte:head>

<Render of={activeSubPage.render} />

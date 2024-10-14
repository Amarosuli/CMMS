<script lang="ts">
	import { MaterialMaster, MaterialUnit, TransactionType } from '$lib/layouts/pages';
	import { Render, createRender } from 'svelte-headless-table';
	import { page } from '$app/stores';

	export let data;
	const { user } = data;

	const basePath = $page.url.pathname;

	let subPages = [
		{
			hash: '#material-master',
			title: 'Material Master',
			render: createRender(MaterialMaster, { user, basePath, tableName: 'Material Master' })
		},
		{
			hash: '#material-unit',
			title: 'Material Unit',
			render: createRender(MaterialUnit, { user, basePath, tableName: 'Material Unit' })
		},
		{
			hash: '#transaction-type',
			title: 'Transaction Type',
			render: createRender(TransactionType, { tableName: 'Transaction Type' })
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

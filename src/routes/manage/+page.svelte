<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/manage/material-master');
	});
</script>

<div>
	<h1>Master Data</h1>
	<p>Master Data means all preset data that used for this application work as espected. And by design, master data is not meant to be editable by common users. Always make sure all changes to master data is maintain by super user.</p>
</div>

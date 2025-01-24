<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
</script>

<div class="absolute inset-0 flex h-screen w-screen items-center justify-center bg-primary/80"></div>
<div class="absolute inset-0 flex flex-col items-center justify-center">
	<div class="flex flex-col items-center gap-2 rounded-xl bg-white p-14">
		<p class="pt-4 text-lg/4 font-extrabold uppercase text-red-500">{page.status} - {page.error?.message}</p>
		<p class="pb-4 text-sm font-semibold text-slate-800">The page you are looking for is doesn't exist</p>
		<Button variant="default" href="/">Back to Home</Button>
	</div>
</div>

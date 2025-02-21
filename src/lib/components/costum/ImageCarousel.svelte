<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel';
	import { getFileUrl } from '$lib/pocketbaseClient';

	let { images, id }: { images: string[]; id: string } = $props();

	let imgs = images.map((name) => {
		return getFileUrl('material_master', id, name);
	});
</script>

<Carousel.Root class="relative max-w-[500px]">
	<Carousel.Content>
		{#each imgs as img}
			<Carousel.Item>
				<div class="flex items-center">
					<img class="aspect-square object-cover" src={img} alt={img} />
				</div>
			</Carousel.Item>
		{/each}
	</Carousel.Content>
	<div class="absolute bottom-10 right-1/2 md:right-[calc(50%)]">
		<Carousel.Previous class="border-0 bg-slate-500 text-white hover:bg-slate-700 hover:text-white" />
		<Carousel.Next class="border-0 bg-slate-500 text-white hover:bg-slate-700 hover:text-white" />
	</div>
</Carousel.Root>

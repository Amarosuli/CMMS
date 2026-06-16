<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Lightbulb, LogOut } from '@lucide/svelte';
	import { logOut } from '$lib/remote-function/auth.remote';
	import { toast } from 'svelte-sonner';
	import type { AuthRecord } from 'pocketbase';

	let { user }: { user: AuthRecord } = $props();
</script>

<span class="relative">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost' }) + 'flex h-12 w-full items-center justify-start'}>
			<div class="flex w-full justify-between gap-2">
				<Avatar.Root>
					<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
					<Avatar.Fallback>CN</Avatar.Fallback>
				</Avatar.Root>
				<div class="flex flex-1 flex-col items-start justify-center max-lg:hidden">
					<span>{user?.name}</span>
					<span class="font-light">{user?.username} as {user?.role}</span>
				</div>
			</div>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Group>
				<DropdownMenu.Item>
					<Lightbulb class="mr-2 h-4 w-4" />
					<span>Share feedback</span>
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<Button
						variant="ghost"
						onclick={() => {
							logOut().then((res) => {
								toast.info(res.message);
								location.reload();
							});
						}}
						class="w-full ">
						<LogOut class="mr-2 h-4 w-4" />
						<span>Log out</span>
					</Button>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</span>

<script lang="ts">
	import type { BorrowMovement } from '$lib/CostumTypes';
	import { time } from '$lib/helpers';

	interface Props {
		borrowData: BorrowMovement;
	}

	let { borrowData }: Props = $props();
</script>

<dl class="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,--spacing(80))_auto] sm:text-sm/6">
	<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Borrower Id</dt>
	<dd class="pt-1 pb-3 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:nth-2:border-none">{borrowData.user.username}</dd>
	<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Borrower Name</dt>
	<dd class="pt-1 pb-3 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:nth-2:border-none">{borrowData.user.name}</dd>
	<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">ESN</dt>
	<dd class="pt-1 pb-3 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:nth-2:border-none">{borrowData.esn}</dd>
	<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Order Number</dt>
	<dd class="pt-1 pb-3 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:nth-2:border-none">{borrowData.order_number}</dd>
	<dt class="col-start-1 border-t border-foreground/5 pt-3 text-foreground/50 first:border-none sm:py-3">Borrow Date</dt>
	<dd class="pt-1 pb-3 text-foreground sm:border-t sm:border-foreground/5 sm:py-3 sm:nth-2:border-none">{time(borrowData.created)}</dd>
</dl>

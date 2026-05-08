import { toast } from 'svelte-sonner';
import type { StockItem } from './CostumTypes';

export const labelCarts = $state({ data: [] as StockItem[] });

export const addToLabelCart = (items: StockItem[]) => {
	labelCarts.data = [...labelCarts.data, ...items];
	toast(`${items.length} Label added to cart`);
};

export const clearLabelCart = () => {
	labelCarts.data.length = 0;
	toast('Label cart cleared');
};

export const removeFromLabelCart = (identity: StockItem['identity']) => {
	const index = labelCarts.data.findIndex((i) => i.identity === identity);

	if (index !== -1) {
		labelCarts.data.splice(index, 1);
		toast('1 Label removed from cart');
	} else {
		toast('Label not found in cart');
	}
};

export const labelCartLength = () => labelCarts.data.length;

import { toast } from 'svelte-sonner';
import type { StockItem } from './CostumTypes';

export const labelCarts = $state({ data: [] as StockItem[] });

export const addToLabelCart = (items: StockItem[]) => {
	const newItems = items.filter((newItem) => !labelCarts.data.some((cartItem) => cartItem.label === newItem.label));

	if (newItems.length === 0) {
		toast(`All label are already in the cart.`);
		return;
	}

	labelCarts.data = [...labelCarts.data, ...newItems];
	toast(`${newItems.length} Label added to cart`);
};

export const clearLabelCart = () => {
	labelCarts.data.length = 0;
	toast('Label cart cleared');
};

export const removeFromLabelCart = (label: StockItem['label']) => {
	const index = labelCarts.data.findIndex((i) => i.label === label);

	if (index !== -1) {
		labelCarts.data.splice(index, 1);
		toast('1 Label removed from cart');
	} else {
		toast('Label not found in cart');
	}
};

export const labelCartLength = () => labelCarts.data.length;

import { time } from './helpers';

let realtime = $state(new Date());
let interval: ReturnType<typeof setInterval> | undefined;

export const clock = {
	start() {
		if (!interval) {
			interval = setInterval(() => {
				realtime = new Date();
			}, 1000);
		}
		// Return the object itself to allow chaining
		return this;
	},

	get realtime() {
		return time(realtime, { format: 'dddd, DD MMMM YYYY - h:mm:ss A' });
	}
};

import { time } from './helpers';

export const clock = () => {
	let realtime = $state(time(new Date()));

	function start() {
		const interval = setInterval(() => {
			realtime = time(new Date());
		}, 1000);
		return () => clearInterval(interval);
	}

	return {
		start,
		get realtime() {
			return realtime;
		}
	};
};

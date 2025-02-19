export namespace timersLocalStorage {
	const TIMERS_KEY = 'fewf-alt1-timers-list';
	
	export function get() : TimerData[] {
		try {
			const json = JSON.parse(localStorage.getItem(TIMERS_KEY) || '');
			if(!json || !Array.isArray(json)) { return []; }
			return json;
		}
		catch(e) { return []; }
	}
	
	export function set(list:TimerData[]) {
		localStorage.setItem(TIMERS_KEY, JSON.stringify(list));
	}
}
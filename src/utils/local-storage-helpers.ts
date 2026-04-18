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

export namespace settingsLocalStorage {
	const TIMERS_KEY = 'fewf-alt1-timers-settings';
	
	interface SettingsProps {
		listLayout: 'grid' | 'list';
	}
	
	function getDefaultSettings() : SettingsProps { return { listLayout: 'grid' }; }
	
	export function getAll() : SettingsProps {
		try {
			const json = JSON.parse(localStorage.getItem(TIMERS_KEY) || '');
			if(!json) { return getDefaultSettings(); }
			return { ...getDefaultSettings(), ...json };
		}
		catch(e) { return getDefaultSettings(); }
	}
	
	export function get<T extends keyof SettingsProps>(field: T) : SettingsProps[T] {
		return getAll()[field];
	}
	
	export function update(data:Partial<SettingsProps>) {
		localStorage.setItem(TIMERS_KEY, JSON.stringify({ ...getAll(), ...data }));
	}
}
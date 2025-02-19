/// <reference types="svelte" />
/// <reference types="vite/client" />

interface Window {
	alt1?: {
		identifyAppUrl(app:string) : void;
	}
}

interface TimerData {
	id: string; // Uuid of the timer
	name: string; // The visual name of the timer
	start: number; // Timestamp (in milliseconds) when the timer was started
	length: number; // Duration (in milliseconds) for the timer to run for
	paused?: number; // Timestamp of when it was paused
}
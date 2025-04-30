interface TimerData {
	id: string; // Uuid of the timer
	name: string; // The visual name of the timer
	start: number; // Timestamp (in milliseconds) when the timer was started
	length: number; // Duration (in milliseconds) for the timer to run for
	paused?: number; // Timestamp of when it was paused
	
	// Features
	notificationOn?: boolean; // Will trigger a notification when timer finishes
	titleBarOn?: boolean; // Will cause this time to appear on title bar (if not paused)
	cursorTooltipOn?: boolean; // Will show a cursor on screen with text altering user of timer being finished
}
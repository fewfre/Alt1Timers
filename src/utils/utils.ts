export function millisecondsToHourMinutes(milliSeconds:number) {
	// let days = Math.floor(milliSeconds/(86400 * 1000));
	// milliSeconds -= days*(86400*1000);
	let hours = Math.floor(milliSeconds/(60 * 60 * 1000 ));
	milliSeconds -= hours * (60 * 60 * 1000);
	let minutes = Math.floor(milliSeconds/(60 * 1000));
	milliSeconds -= minutes * (60 * 1000);
	let seconds = Math.floor(milliSeconds/1000);
	return { hours, minutes, seconds };
}

export const formatTime = (nums:number[]) => nums.map(num=>String(num).padStart(2,'0')).join(':');

export function getInitialTimestamp(milliSeconds:number) {
	const { hours, minutes, seconds } = millisecondsToHourMinutes(milliSeconds);
	return [
		!!hours && `${hours}h`,
		!!minutes && `${minutes}m`,
		(!!seconds || (!hours && !minutes)) && `${seconds}s`,
	].filter(o=>!!o).join(' ');
	// return [
	//     days > 0 && `${days} day${days === 1 ? '' : 's'}`,
	//     (!!hours || !!minutes) && formatTime([hours, minutes])
	// ].filter(s=>!!s).join(" ");
}

export function getCountdownTimestamp(milliSeconds:number) {
	const { hours, minutes, seconds } = millisecondsToHourMinutes(milliSeconds);
	return !!hours ? `${hours}h `+formatTime([minutes, seconds!]) : !!minutes ? formatTime([minutes, seconds!]) : `${seconds}s`;
	// return [
	//     days > 0 && `${days} day${days === 1 ? '' : 's'}`,
	//     (!!hours || !!minutes || !!seconds) && formatTime(!!hours || !!days ? [hours, minutes, seconds!] : [minutes, seconds!])
	// ].filter(s=>!!s).join(" ");
}

export function getTitleBarCountdownTimestamp(milliSeconds:number) {
	const { hours, minutes, seconds } = millisecondsToHourMinutes(milliSeconds);
	return milliSeconds < 60*1000 && milliSeconds > 0 ? `${seconds}s` : `${hours ?? 0}:${String(minutes ?? 0).padStart(2,'0')}`;
}
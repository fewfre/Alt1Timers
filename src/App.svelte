<script lang="ts">
    import { onDestroy } from 'svelte'
	import Timer from './lib/Timer.svelte';
    import { timersLocalStorage } from './utils/local-storage-helpers';
    import { ComponentWindow } from './utils/ComponentWindow';
    import TimerEditForm from './lib/TimerEditForm.svelte';
    import { getInitialTimestamp, getTitleBarCountdownTimestamp } from './utils/utils';
    import Alt1ToolkitAlert from './lib/Common/Alt1ToolkitAlert.svelte';
	const alt1 = window.alt1;
	
	let timers: TimerData[] = $state(timersLocalStorage.get())
	
	let addTimerDisabled = $derived(!!timers.find(t=>t.length === 0));
	
	const saveTimersToLocalStorage = () => { timersLocalStorage.set(timers); };
	
	const getTimer = (id:string) => timers.find(t => t.id === id)!;
	const getTimerIndex = (id:string) => timers.findIndex(t => t.id === id)!;
	
	const onDeleteTimer = (id:string) => {
		timers.splice(getTimerIndex(id), 1);
		saveTimersToLocalStorage();
	};
	const onAddTimer = (data:TimerData) => {
		timers.push(data);
		saveTimersToLocalStorage();
	};
	const onUpdateTimer = (data:TimerData) => {
		timers[getTimerIndex(data.id)] = data;
		saveTimersToLocalStorage();
	};
	const onTimerFinished = (data:TimerData) => {
		// alert(`TIMER! ${data.name}`);
		if(data.notificationOn) {
			if(alt1) {
				alt1?.showNotification("Alt1 Timers", `The timer "${data.name || getInitialTimestamp(data.length)}" has finished.`, '');
			} else if("Notification" in window && Notification.permission !== "denied") {
				(Notification.permission === "granted" ? Promise.resolve() : Notification.requestPermission()).then(()=>{
					const notification = new Notification("Alt1 Timers", { body:`The timer "${data.name || getInitialTimestamp(data.length)}" has finished.`, icon:"icon.png" });
					setTimeout(() => { notification.close(); }, 5000);
				});
			}
		}
	};
	const onOpenAddTimerForm = () => {
		// timers.push({ id:`id${Date.now()}`, name:'', start:0, length:0 });
		openTimerEditForm(true, { id:`id${Date.now()}`, name:'', start:0, length:0 });
		// Don't save it until the user finalizes it in a later step
	};
	const onOpenEditForm = (data:TimerData) => {
		openTimerEditForm(false, data);
	};
	
	let now = $state(Date.now()); // This `now` is also passed to each timer, which can be used in an $effect to trigger visual updates
	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
			const titlebarEntries:string[] = [], tooltipEntries:string[] = [];
			timers.forEach(({ name, start, length, paused, titleBarOn, cursorTooltipOn })=>{
				if(titleBarOn && !paused) titlebarEntries.push(`${name || '⏲'} ${getTitleBarCountdownTimestamp(length*(1-Math.min((now - start) / length, 1)))}`.trim());
				if(cursorTooltipOn && !paused && now > start+length) tooltipEntries.push(`"${name || getInitialTimestamp(length)}" timer finished`);
			});
			alt1?.setTitleBarText(!titlebarEntries.length ? '' : titlebarEntries.join(" ¦ "));
			alt1?.setTooltip(!tooltipEntries.length ? '' : tooltipEntries.join('\n'));
		}, 500);
		return () => { clearInterval(interval); };
	});
	

	//////////////////////
	// Popup Window Controller
	//////////////////////
	let componentWindow = new ComponentWindow()
	onDestroy(() => componentWindow.destroy())
	// $: if (component) component.$set({ value })

	async function openTimerEditForm(isNew:boolean, data:TimerData) {
		if (componentWindow.isOpened) { componentWindow.focus(); }
		else { await componentWindow.openWindow(isNew ? "Add timer" : "Edit Timer", 400, 154); }
		
		const onSubmit = (data:TimerData) => {
			if(isNew) { onAddTimer(data); }
			else { onUpdateTimer(data); }
			componentWindow.closeWindow();
		};
		
		const onCancel = () => componentWindow.closeWindow();
		
		componentWindow.mountComponent(TimerEditForm, { props:{ data, onSubmit, onCancel } });
	}
</script>

<svelte:window onunload={()=>{
	alt1?.setTitleBarText('');
	alt1?.clearTooltip();
}} />

<div>
	<main>
		{#if !alt1}
			<Alt1ToolkitAlert appconfigUrl="https://projects.fewfre.com/runescape/alt1-timers/appconfig.json" />
		{/if}
		<ul class="timers-list">
			{#each timers as timer}
				<li><Timer data={timer} {...{ onDeleteTimer, onUpdateTimer, onOpenEditForm, onTimerFinished, now }} /></li>
			{/each}
			{#if !addTimerDisabled}
				<li class="add-timer-wrapper">
					<button class="add-timer-button" onclick={onOpenAddTimerForm}><span>Add Timer</span></button>
				</li>
			{/if}
		</ul>
	</main>
</div>

<style>
	.timers-list {
		display: grid;
		gap: 5px 5px;
		padding: 5px;
		margin: 0;
		grid-template-columns: 1fr;
		list-style: none;
		
		@media (min-width: 600px) {
			grid-template-columns: repeat(2, 1fr);
		}
		
		@media (min-width: 1200px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.add-timer-wrapper {
		display: flex;
		justify-content: center;
		padding: 5px 10px;
		background: #FFFFFF22;
		border: 2px solid #FFFFFF55;
		border-radius: 4px;
	}
	.add-timer-button {
		/* https://uiverse.io/mrhyddenn/afraid-skunk-10 */
		min-width: 125px;
		padding: 0 20px;
		display: inline-block;
		font-size: 14px;
		font-weight: 600;
		color: #111;
		text-transform: uppercase;
		background: #ccc;
		border: none;
		cursor: pointer;
		transform: skew(-21deg);
		
		span {
			display: inline-block;
			transform: skew(21deg);
		}
		&::before {
			content: '';
			position: absolute;
			top:0;bottom:0;left: 0;
			right: 100%;
			
			background: #111;
			opacity: 0;
			z-index: -1;
			transition: all 0.5s;
		}
		&:hover {
			color: #fff;
		}
		&:hover::before {
			left: 0;
			right: 0;
			opacity: 1;
		}
	}
</style>

<script lang="ts">
	import Timer from './lib/Timer.svelte';
    import { timersLocalStorage } from './utils/local-storage-helpers';
	
	let timers: TimerData[] = $state(timersLocalStorage.get())
	
	let addTimerDisabled = $derived(!!timers.find(t=>t.length === 0));
	
	const saveTimersToLocalStorage = () => { timersLocalStorage.set(timers); };
	
	const getTimer = (id:string) => timers.find(t => t.id === id)!;
	const getTimerIndex = (id:string) => timers.findIndex(t => t.id === id)!;
	
	const onDeleteTimer = (id:string) => {
		timers.splice(getTimerIndex(id), 1);
		saveTimersToLocalStorage();
	};
	const onUpdateTimer = (data:TimerData) => {
		timers[getTimerIndex(data.id)] = data;
		saveTimersToLocalStorage();
	};
	const onTimerFinished = (data:TimerData) => {
		// alert(`TIMER! ${data.name}`);
	};
	const onAddTimer = () => {
		timers.push({ id:`id${Date.now()}`, name:'', start:0, length:0 });
		// Don't save it until the user finalizes it in a later step
	};
</script>

<div>
	<main>
		<ul class="timers-list">
			{#each timers as timer}
				<li><Timer data={timer} {...{ onDeleteTimer, onUpdateTimer, onTimerFinished }} /></li>
			{/each}
			{#if !addTimerDisabled}
				<li class="add-timer-wrapper">
					<button class="add-timer-button" onclick={onAddTimer}><span>Add Timer</span></button>
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

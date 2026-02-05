<script lang="ts">
    import { AudioLoader, presetSounds } from "../utils/audio";
    import { millisecondsToHourMinutes } from "../utils/utils";
    import Switch from "./Common/Switch.svelte";

    interface Props {
        data: TimerData;
		onSubmit: (data:TimerData) => void;
		onCancel: () => void;
    }
	// let { data, onDeleteTimer, onUpdateTimer, onTimerFinished } : Props = $props();
	let { data, onSubmit, onCancel } : Props = $props();
	
	let { hours:initialHours, minutes:initialMinutes } = millisecondsToHourMinutes(data.length);
	
	let edit_name : string = $state(data.name);
	let edit_hours : number = $state(initialHours ?? 0);
	let edit_minutes : number = $state(initialMinutes ?? 0);
	
	let edit_notificationOn : boolean = $state(!!data.notificationOn);
	let edit_titleBarOn : boolean = $state(!!data.titleBarOn);
	let edit_cursorTooltipOn : boolean = $state(!!data.cursorTooltipOn);
	let edit_sound : string = $state(data.sound ?? '');
	
    // svelte-ignore non_reactive_update - don't care about detecting changes
    let minutesInput:HTMLInputElement;
    const onSave = (e:SubmitEvent) => {
		e.preventDefault()
        if(edit_hours+edit_minutes <= 0) {
            minutesInput.setCustomValidity("Must have a total time greater than 0");
            minutesInput.reportValidity();
            return;
        }
        
        const newLength = (((edit_hours) * 60) + edit_minutes) * 60 * 1000;
		const start = data.start;
        const restart = start===0 || Date.now() > start+newLength;
		onSubmit({
			...data,
			name:edit_name, start:restart ? Date.now() : start, length:newLength, paused:undefined,
			notificationOn:  edit_notificationOn || undefined,
			titleBarOn:      edit_titleBarOn || undefined,
			cursorTooltipOn: edit_cursorTooltipOn || undefined,
			sound: edit_sound || undefined,
		});
    };
    
    function clearMinutesValidation() {
        minutesInput.setCustomValidity("");
    }
</script>

<form class='edit-grid' onsubmit={onSave}>
	<div>
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label>Name</label>
		<input type="text" placeholder="Timer" bind:value={edit_name} />
	</div>
	<div class="edit-time-grid">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label>Hours</label>
		<input type="number" step="1" min="0" bind:value={edit_hours} oninput={()=>clearMinutesValidation()} />
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label>Minutes</label>
		<input type="number" step="1" min="0" bind:value={edit_minutes} bind:this={minutesInput} oninput={()=>clearMinutesValidation()} />
	</div>
	<div class="switches-grid">
		<div class="switch-group">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>Notification</label>
			<Switch bind:checked={edit_notificationOn} />
		</div>
		<div class="switch-group">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>Show on Titlebar</label>
			<Switch bind:checked={edit_titleBarOn} />
		</div>
		<div class="switch-group">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>Cursor Tooltip</label>
			<Switch bind:checked={edit_cursorTooltipOn} />
		</div>
	</div>
	<div class="volume-group">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label>Audio Alarm</label>
		<select bind:value={edit_sound} onchange={()=>{
			if(edit_sound) AudioLoader.play(edit_sound);
		}}>
			<option value=''>[None]</option>
			{#each Object.entries(presetSounds) as [key, sfx]}
				<option value={key}>{sfx.name}</option>
			{/each}
		</select>
	</div>
	<div class="edit-grid-actions">
		<div></div>
		<button class='btn' type="submit">Save</button>
		<div><button class='btn' type="button" onclick={onCancel}>Cancel</button></div>
	</div>
</form>

<style>
	.edit-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px 6px;
		padding: 6px 10px;
		width: 100%;
		box-sizing: border-box;
		
		label { color: #DDD; }
		input { width: 100%; box-sizing: border-box; }
		
		.edit-time-grid {
			display: grid;
			grid-template-columns: auto 1fr;
			gap: 2px 4px;
			width: 100%;
		}
		
		.switches-grid {
			grid-column: span 2;
			display: flex;
			justify-content: space-between;
			gap: 2px 4px;
			width: 100%;
		}
		.switch-group {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}
		
		.volume-group {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}
		
		.edit-grid-actions {
			grid-column: span 2;
			display:grid;
			grid-template-columns: 1fr 40% 1fr;
			justify-content: center;
			gap: 3px;
			margin-top: 5px;
			
			*:last-child {
				display: flex;
				justify-content: end;
			}
		}
	}

	.btn {
		all: unset;
		display: flex;
		align-items: center;
		justify-content: center;
		padding:2px 4px;
		
		color:#000;
		font-size:13px;
		background:#EAEAEA;
		border-radius:3px;
		cursor:pointer;
		
		&:hover{ background:#DDD; }
		
		/* svg { line-height: 0; } */
	}
</style>
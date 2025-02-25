<script lang="ts">
    import { millisecondsToHourMinutes } from "../utils/utils";

    interface Props {
        data: TimerData;
		onSubmit: (data:TimerData) => void;
		onCancel: () => void;
    }
	// let { data, onDeleteTimer, onUpdateTimer, onTimerFinished } : Props = $props();
	let { data, onSubmit, onCancel } : Props = $props();
	
	let { hours:initialHours, minutes:initialMinutes } = millisecondsToHourMinutes(data.length);
	
	let edit_name : string = $state(data.name);
	let edit_hours : number = $state(initialHours);
	let edit_minutes : number = $state(initialMinutes);
	
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
		onSubmit({ ...data, name:edit_name, start:restart ? Date.now() : start, length:newLength, paused:undefined });
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
        
        .edit-grid-actions {
            grid-column: span 2;
            display:grid;
            grid-template-columns: 1fr 40% 1fr;
            justify-content: center;
            gap: 3px;
            
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
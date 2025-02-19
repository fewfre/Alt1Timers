<script lang="ts">
    import CloseIcon from "../assets/CloseIcon.svg.svelte";
    import EditIcon from "../assets/EditIcon.svg.svelte";
    import PauseIcon from "../assets/PauseIcon.svg.svelte";
    import PlayIcon from "../assets/PlayIcon.svg.svelte";
import RefreshIcon from "../assets/RefreshIcon.svg.svelte";

    interface Props {
        data: TimerData;
        onDeleteTimer: (id:string) => void;
        onUpdateTimer: (data:TimerData) => void;
        onTimerFinished: (data:TimerData) => void;
    }
	let { data, onDeleteTimer, onUpdateTimer, onTimerFinished } : Props = $props();
	const { id, name, start, length, paused } = $derived(data);
	let progress : number = $state(0);
    
    // svelte-ignore state_referenced_locally - ok to ignore this since I only care about this check during first render
	let mode : 'view' | 'edit' = $state(length === 0 ? 'edit' : 'view');
    
	let edit_name : string = $state('');
	let edit_hours : number = $state(0);
	let edit_minutes : number = $state(0);
    
    const onStartEditMode = (milliSeconds:number) => {
        const { hours, minutes } = millisecondsToHourMinutes(milliSeconds);
        edit_name = name;
        edit_hours = hours;
        edit_minutes = minutes;
        mode = "edit";
    };
    // svelte-ignore non_reactive_update - don't care about detecting changes
    let minutesInput:HTMLInputElement;
    const onSave = (e:SubmitEvent) => {
        if(edit_hours+edit_minutes <= 0) {
            minutesInput.setCustomValidity("Must have a total time greater than 0");
            minutesInput.reportValidity();
            e.preventDefault()
            return;
        }
        
        const newLength = (((edit_hours) * 60) + edit_minutes) * 60 * 1000;
        const restart = start===0 || Date.now() > start+newLength;
        onUpdateTimer({ ...data, name:edit_name, start:restart ? Date.now() : start, length:newLength, paused:undefined });
        mode = "view";
    };
    const onTogglePause = () => {
        if(paused) {
            onUpdateTimer({ ...data, paused:undefined, start:start + (Date.now() - paused) });
        } else {
            onUpdateTimer({ ...data, paused:Date.now() });
        }
    };
    const onStartTimer = () => {
        onUpdateTimer({ ...data, start:Date.now(), paused:undefined });
    };
    
    function millisecondsToHourMinutes(milliSeconds:number) {
        // let days = Math.floor(milliSeconds/(86400 * 1000));
        // milliSeconds -= days*(86400*1000);
        let hours = Math.floor(milliSeconds/(60 * 60 * 1000 ));
        milliSeconds -= hours * (60 * 60 * 1000);
        let minutes = Math.floor(milliSeconds/(60 * 1000));
        milliSeconds -= minutes * (60 * 1000);
        let seconds = Math.floor(milliSeconds/1000);
        return { hours, minutes, seconds };
    }
    
    function updateTimerVisuals() {
        const now = Date.now();
        const timeLeft = now - start;
        let oldProgress = progress;
        progress = Math.min(timeLeft / length, 1);
        if(progress === 1 && oldProgress < 1 && oldProgress != 0) {
            onTimerFinished(data);
        }
    }
    
    const formatTime = (nums:number[]) => nums.map(num=>String(num).padStart(2,'0')).join(':')
    
    function getInitialTimestamp(milliSeconds:number) {
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
    
    function getCountdownTimestamp(milliSeconds:number) {
        const { hours, minutes, seconds } = millisecondsToHourMinutes(milliSeconds);
        return !!hours ? `${hours}h `+formatTime([minutes, seconds!]) : !!minutes ? formatTime([minutes, seconds!]) : `${seconds}s`;
        // return [
        //     days > 0 && `${days} day${days === 1 ? '' : 's'}`,
        //     (!!hours || !!minutes || !!seconds) && formatTime(!!hours || !!days ? [hours, minutes, seconds!] : [minutes, seconds!])
        // ].filter(s=>!!s).join(" ");
    }
    
    function clearMinutesValidation() {
        minutesInput.setCustomValidity("");
    }
    
	$effect(() => {
        updateTimerVisuals();
		const interval = setInterval(() => {
            if(paused) return;
			updateTimerVisuals();
		}, 500);
		return () => { clearInterval(interval); };
	});
</script>

{#if mode === 'view'}
    <div class={["timer", { "complete": !paused && progress >= 1 }]}>
        <div class='progressbar-fill' style={`width:${paused ? 0 : (progress)*100}%`}></div>
        <div class='timer-tray'>
            <div class="info">
                {#if name}
                    <span class="hide-on-timer-hover">{name}</span>
                    <span class="show-on-timer-hover"><span class="timestamp">{getInitialTimestamp(length)}</span></span>
                {:else}
                <span class="timestamp">{getInitialTimestamp(length)}</span>
                {/if}
            </div>
            <div class="countdown">
                <span class="timestamp">{paused ? "PAUSED" : progress === 1 ? "DONE" : getCountdownTimestamp(length*(1-progress))}</span>
            </div>
            <div class="actions">
               <div class="btn-group">
                    <button class='btn red-text show-on-timer-hover' onclick={()=>onDeleteTimer(id)}><CloseIcon size={13} /></button>
                    <button class='btn show-on-timer-hover' onclick={()=>onStartEditMode(length)}><EditIcon size={13} /></button>
                </div>
                <div class="btn-group">
                    {#if progress < 1 || paused}
                        <button class='btn' onclick={onTogglePause}>{#if paused}<PlayIcon size={13} />{:else}<PauseIcon size={13} />{/if}</button>
                    {/if}
                    <button class='btn' onclick={onStartTimer}><RefreshIcon size={13} /></button>
               </div>
            </div>
        </div>
    </div>
{:else if mode === 'edit'}
    <div class="timer">
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
                <div><button class='btn' type="button" onclick={length > 0 ? ()=>{ mode = 'view'; } : ()=>onDeleteTimer(id)}>Cancel</button></div>
            </div>
        </form>
    </div>
{/if}

<style>
    .timer {
        position:relative;
        display:flex;
        padding:3px;
        background:#273035;
        border-radius:4px;
    }
    .timer-tray {
        z-index: 1;
        display:grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 6px;
        width: 100%; height:100%;
        padding: 4px 4px 4px 6px;
        background: #171E24DD;
        border-radius:4px;
        
        .complete & {
            background: #171E2499;
        }
    }
    .timestamp {
        font-family: monospace;
        font-size: 90%;
        padding: 2px 5px;
        background: #00000088;
        border-radius:4px;
    }
    .info {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .countdown {
        /* Hide countdown on hover, but only if small screen, since there's room otherwise */
		@media (max-width: 290px) {
            .timer:hover & .timestamp {
                display: none;
            }
		}
    }
    .actions {
        display:flex;
        justify-content: end;
        gap: 3px;
    }
    
    .progressbar-fill {
        position:absolute;
        top:0px; left:0px;
        height:100%;
        background:#777;
        border-radius:4px;
    }
    
    .edit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 6px;
        padding: 1px 4px;
        width: 100%;
        
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
    .btn-group {
        display: flex;
        .btn {
            border-radius: 0;
            &:first-of-type { border-top-left-radius: 3px; border-bottom-left-radius: 3px; }
            &:last-of-type { border-top-right-radius: 3px; border-bottom-right-radius: 3px; }
        }
        .btn + .btn { border-left: 1px solid #999; }
    }
    
    .red-text { color:red; }
    
    .show-on-timer-hover { .timer:not(:hover) & { display:none } }
    .hide-on-timer-hover { .timer:hover & { display:none } }
</style>
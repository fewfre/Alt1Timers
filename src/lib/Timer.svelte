<script lang="ts">
    import CloseIcon from "../assets/CloseIcon.svg.svelte";
    import EditIcon from "../assets/EditIcon.svg.svelte";
    import PauseIcon from "../assets/PauseIcon.svg.svelte";
    import PlayIcon from "../assets/PlayIcon.svg.svelte";
	import RefreshIcon from "../assets/RefreshIcon.svg.svelte";
    import { millisecondsToHourMinutes } from "../utils/utils";

    interface Props {
        data: TimerData;
        onDeleteTimer: (id:string) => void;
        onUpdateTimer: (data:TimerData) => void;
        onOpenEditForm: (data:TimerData) => void;
        onTimerFinished: (data:TimerData) => void;
    }
	let { data, onDeleteTimer, onUpdateTimer, onOpenEditForm, onTimerFinished } : Props = $props();
	const { id, name, start, length, paused } = $derived(data);
	let progress : number = $state(0);
    
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
    
	$effect(() => {
        updateTimerVisuals();
		const interval = setInterval(() => {
            if(paused) return;
			updateTimerVisuals();
		}, 500);
		return () => { clearInterval(interval); };
	});
	
</script>

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
				<!-- <button class='btn show-on-timer-hover' onclick={()=>onStartEditMode(length)}><EditIcon size={13} /></button> -->
				<button class='btn show-on-timer-hover' onclick={()=>onOpenEditForm(data)}><EditIcon size={13} /></button>
			</div>
			<div class="btn-group">
				{#if progress >= 1 && !paused}
					<button class='btn' onclick={onStartTimer}>Restart</button>
				{:else}
					<button class='btn' onclick={onTogglePause}>{#if paused}<PlayIcon size={13} />{:else}<PauseIcon size={13} />{/if}</button>
					<button class='btn' onclick={onStartTimer}><RefreshIcon size={13} /></button>
				{/if}
			</div>
		</div>
	</div>
</div>

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
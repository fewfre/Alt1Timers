<script lang="ts">
    import type { Snippet } from 'svelte';
	import { dragDropStore } from '../DragAndDrop/dragdrop';
	type Props = { id:string; index:number; list:any[]; onDrop: (draggedIndex: number, dropIndex: number) => void; children:Snippet };
	const { id, index, list, onDrop, children } : Props = $props();
</script>

<li 
	class={["draggable", { dragging: $dragDropStore.draggedId === id, "drag-over": $dragDropStore.draggedOverIndex === index && $dragDropStore.draggedId !== null }]}
	draggable="true"
	ondragstart={(e) => dragDropStore.onDragStart(id, e)}
	ondragover={(e) => dragDropStore.onDragOver(index, e)}
	ondrop={(e) => dragDropStore.onDrop(index, e, list, onDrop)}
	ondragend={() => dragDropStore.onDragEnd()}
	ondragleave={() => dragDropStore.onDragLeave()}
>
  {@render children?.()}
</li>


<style>
.draggable {
	transition: opacity 0.2s ease;
	cursor: move;
}

.draggable.dragging {
	opacity: 0.5;
	cursor: grabbing;
}

.draggable.drag-over {
	outline: 2px solid #4CAF50;
	outline-offset: -2px;
	border-radius: 4px;
	
	/* Show a marker to make it more obvious where it will be dropped */
	&::before {
		content: "";
		position: absolute;
		width: 2px;
		height: 16px;
		border-radius: 50px;
		background: white;
		transform: translate(-3px, 50%);
	}
}
</style>
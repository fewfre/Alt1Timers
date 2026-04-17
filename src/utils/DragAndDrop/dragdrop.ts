import { get, writable } from 'svelte/store';

export interface DragDropState {
	draggedId: string | null;
	draggedOverIndex: number | null;
}

function createDragDropStore() {
	const { subscribe, set, update } = writable<DragDropState>({
		draggedId: null,
		draggedOverIndex: null,
	});

	return {
		subscribe,
		onDragStart: (id: string, e: DragEvent) => {
			update((state) => ({ ...state, draggedId: id }));
			if (e.dataTransfer) {
				e.dataTransfer.effectAllowed = 'move';
			}
		},
		onDragOver: (index: number, e: DragEvent) => {
			e.preventDefault();
			if (e.dataTransfer) {
				e.dataTransfer.dropEffect = 'move';
			}
			update((state) => ({ ...state, draggedOverIndex: index }));
		},
		onDrop: <T extends { id: string }>(
			dropIndex: number,
			e: DragEvent,
			list: T[],
			onReorder: (draggedIndex: number, dropIndex: number) => void,
		) => {
			e.preventDefault();
			const state = get(dragDropStore);
			if (state.draggedId === null) return;

			const draggedIndex = list.findIndex((t) => t.id === state.draggedId);
			if (draggedIndex === dropIndex) {
				set({ draggedId: null, draggedOverIndex: null });
				return;
			}

			// Call the provided reorder function with the dragged and drop indices
			onReorder(draggedIndex, dropIndex);

			set({ draggedId: null, draggedOverIndex: null });
		},
		onDragEnd: () => {
			set({ draggedId: null, draggedOverIndex: null });
		},
		onDragLeave: () => {
			update((state) => ({ ...state, draggedOverIndex: null }));
		},
	};
}

export const dragDropStore = createDragDropStore();
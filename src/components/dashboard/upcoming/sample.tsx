import { useState } from "react";
import {
	DndContext,
	PointerSensor,
	KeyboardSensor,
	useSensor,
	useSensors,
	closestCorners, // Better for multi-container
	DragOverlay,
	type DragEndEvent,
	type DragOverEvent,
	type UniqueIdentifier,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

// each entry should have a unique id and name
type UserItem = {
	id: string;
	name: string;
};
type UserAssignment = {
	online: UserItem[]; // user id array
	offline: UserItem[];
};

function hasOwnKey<T extends object>(obj: T, key: PropertyKey): key is keyof T {
	return Object.hasOwn(obj, key);
}

const useMultiTableDnD = () => {
	const [items, setItems] = useState<UserAssignment>({
		online: [
			{
				id: "1",
				name: "Alice",
			},
			{
				id: "2",
				name: "Bob",
			},
		],
		offline: [
			{
				id: "3",
				name: "Charlie",
			},
			{
				id: "4",
				name: "Diana",
			},
		],
	});

	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const findContainer = (
		userId: UniqueIdentifier,
	): keyof UserAssignment | null => {
		// Optional: if a container id itself is passed in
		if (hasOwnKey(items, userId)) return userId;

		for (const key in items) {
			if (!hasOwnKey(items, key)) continue;

			if (items[key].some((item) => item.id === userId)) {
				return key;
			}
		}

		return null;
	};

	// 1. Logic to handle the move while hovering over the other table
	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		const overId = over?.id;

		if (!overId || active.id === overId) return;

		const activeContainer = findContainer(active.id);
		const overContainer = findContainer(overId);

		if (!activeContainer || !overContainer || activeContainer === overContainer)
			return;

		setItems((prev) => {
			const activeItems = prev[activeContainer];
			const overItems = prev[overContainer];
			const activeIndex = activeItems.findIndex(
				(item) => item.id === active.id,
			);
			const overIndex = overItems.findIndex((item) => item.id === overId);

			let newIndex;
			if (overId in prev) {
				newIndex = overItems.length + 1;
			} else {
				const isBelowLastItem = over && overIndex === overItems.length - 1;
				const modifier = isBelowLastItem ? 1 : 0;
				newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
			}

			return {
				...prev,
				[activeContainer]: [
					...prev[activeContainer].filter((item) => item.id !== active.id),
				],
				[overContainer]: [
					...prev[overContainer].slice(0, newIndex),
					items[activeContainer][activeIndex],
					...prev[overContainer].slice(newIndex),
				],
			};
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		const activeContainer = findContainer(active.id);
		const overContainer = over ? findContainer(over.id) : null;

		if (
			over &&
			activeContainer &&
			overContainer &&
			activeContainer === overContainer
		) {
			const activeIndex = items[activeContainer].findIndex(
				(item) => item.id === active.id,
			);
			const overIndex = items[activeContainer].findIndex(
				(item) => item.id === over.id,
			);

			if (activeIndex !== overIndex) {
				setItems((prev) => ({
					...prev,
					[activeContainer]: arrayMove(
						prev[activeContainer],
						activeIndex,
						overIndex,
					),
				}));
			}
		}
		setActiveId(null);
	};
	return {
		items,
		activeId,
		sensors,
		handleDragOver,
		handleDragEnd,
		setActiveId,
	};
};

export default function MultiTableDnD() {
	const {
		items,
		activeId,
		sensors,
		handleDragOver,
		handleDragEnd,
		setActiveId,
	} = useMultiTableDnD();
	return (
		<div className="p-10 space-y-10">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners} // Use corners for better detection
				onDragStart={({ active }) => setActiveId(active.id)}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<TableContainer id="online" title="Online" items={items.online} />
				<TableContainer id="offline" title="Offline" items={items.offline} />

				{/* Optional: Smooth dragging visuals */}
				<DragOverlay>
					{activeId ? (
						<div className="bg-white border p-4 shadow-lg rounded w-full opacity-80">
							Dragging Item...
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

// --- Helper Components ---

function TableContainer({
	id,
	title,
	items,
}: {
	id: keyof UserAssignment;
	title: string;
	items: UserItem[];
}) {
	return (
		<div className="border rounded-lg p-4 bg-slate-50">
			<h2 className="font-bold mb-4">{title}</h2>
			<SortableContext
				id={id}
				items={items}
				strategy={verticalListSortingStrategy}
			>
				<Table className="bg-white">
					<TableBody ref={null}>
						{items.map((item) => (
							<SortableRow key={item.id} id={item.id} item={item} />
						))}
						{items.length === 0 && (
							<TableRow>
								<TableCell className="text-center text-muted-foreground h-20">
									Drop items here
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</SortableContext>
		</div>
	);
}

function SortableRow({ id, item }: { id: UniqueIdentifier; item: UserItem }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });
	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: isDragging ? 0.3 : 1,
	};

	return (
		<TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<TableCell className="font-medium">{item.id}</TableCell>
			<TableCell>{item.name}</TableCell>
		</TableRow>
	);
}

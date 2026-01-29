import { useState } from "react";
import { toast } from "sonner";
import { getJapanTimeAsJSDate, getJapanTimeAsObject } from "@/lib/date";
import { trpc } from "@/lib/trpc/client";
import { useMobile } from "@/lib/useMobile";
import type { UpcomingSlot } from "@/types/upcoming-slot";
import {
	PointerSensor,
	KeyboardSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragOverEvent,
	type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { User } from "@/types/user";

export type UserEntry = {
	id: string;
	userId: string;
	username: string;
};
export type UserAssignment = {
	online: UserEntry[]; // user id array
	offline: UserEntry[];
};

function hasOwnKey<T extends object>(obj: T, key: PropertyKey): key is keyof T {
	return Object.hasOwn(obj, key);
}

type Props = {
	channel: UpcomingSlot;
	users: User[];
	refetchUpcomingSlots: () => void;
};
export const useUpcomingCard = (props: Props) => {
	const { channel, users, refetchUpcomingSlots } = props;

	const [isHandlingRemoveUsers, setIsHandlingRemoveUsers] = useState(false);
	const [selectedRemoveUserIds, setSelectedRemoveUserIds] = useState<string[]>(
		[],
	);
	const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		getJapanTimeAsJSDate(channel.date),
	);
	const {
		mutate: removeOfflineUsersMutation,
		isPending: loadingRemoveOfflineUsersMutation,
	} = trpc.upcoming.removeOfflineUsers.useMutation();
	const {
		mutate: removeOnlineUsersMutation,
		isPending: loadingRemoveOnlineUsersMutation,
	} = trpc.upcoming.removeOnlineUsers.useMutation();
	const loadingRemoveUsersMutation =
		loadingRemoveOfflineUsersMutation || loadingRemoveOnlineUsersMutation;
	const { mutate: changeDateMutation, isPending: loadingChangeDateMutation } =
		trpc.upcoming.changeDate.useMutation();
	const {
		mutate: deleteUpcomingSlotMutation,
		isPending: loadingDeleteUpcomingSlotMutation,
	} = trpc.upcoming.delete.useMutation();

	const startHandlingRemoveUsers = (_channelId: string) => {
		setIsHandlingRemoveUsers(true);
		setSelectedRemoveUserIds([]);
	};

	const endHandlingRemoveUsers = () => {
		setIsHandlingRemoveUsers(false);
		setSelectedRemoveUserIds([]);
	};

	const toggleSelectedRemoveUser = (userId: string) => {
		if (selectedRemoveUserIds.includes(userId)) {
			setSelectedRemoveUserIds(
				selectedRemoveUserIds.filter((id) => id !== userId),
			);
		} else {
			setSelectedRemoveUserIds([...selectedRemoveUserIds, userId]);
		}
	};

	const executeRemoveUsers = () => {
		if (selectedRemoveUserIds.length === 0) {
			toast.error("No users selected");
			return;
		}
		const offlineUsersToRemove = selectedRemoveUserIds.filter((id) =>
			channel.offlineUserIds.includes(id),
		);
		const onlineUsersToRemove = selectedRemoveUserIds.filter((id) =>
			channel.onlineUserIds.includes(id),
		);

		const promises: Promise<void>[] = [];

		if (offlineUsersToRemove.length > 0) {
			promises.push(
				new Promise((resolve, reject) => {
					removeOfflineUsersMutation(
						{ channelId: channel.channelId, userIds: offlineUsersToRemove },
						{
							onSuccess: (result) => {
								if (result.success) {
									resolve();
								} else {
									reject(new Error("Failed to remove offline users"));
								}
							},
							onError: (error) => reject(error),
						},
					);
				}),
			);
		}

		if (onlineUsersToRemove.length > 0) {
			promises.push(
				new Promise((resolve, reject) => {
					removeOnlineUsersMutation(
						{ channelId: channel.channelId, userIds: onlineUsersToRemove },
						{
							onSuccess: (result) => {
								if (result.success) {
									resolve();
								} else {
									reject(new Error("Failed to remove online users"));
								}
							},
							onError: (error) => reject(error),
						},
					);
				}),
			);
		}

		Promise.all(promises)
			.then(() => {
				toast.success("Users removed successfully");
				refetchUpcomingSlots();
				endHandlingRemoveUsers();
			})
			.catch((error) => {
				toast.error(error.message || "Failed to remove users");
				endHandlingRemoveUsers();
			});
	};

	const executeDateChange = () => {
		if (!selectedDate) {
			toast.error("Please select a date");
			return;
		}
		changeDateMutation(
			{
				channelId: channel.channelId,
				date: selectedDate.toISOString(),
			},
			{
				onSuccess: (result) => {
					if (result.success) {
						toast.success("Date changed successfully");
						refetchUpcomingSlots();
						setIsDateDialogOpen(false);
					} else {
						toast.error("Failed to change date");
					}
				},
				onError: (error) => {
					toast.error(error.message);
					setIsDateDialogOpen(false);
				},
			},
		);
	};

	const openDateDialog = () => {
		setSelectedDate(getJapanTimeAsJSDate(channel.date));
		setIsDateDialogOpen(true);
	};

	const closeDateDialog = () => {
		setIsDateDialogOpen(false);
		setSelectedDate(getJapanTimeAsJSDate(channel.date));
	};

	const handleDeleteUpcomingSlot = () => {
		deleteUpcomingSlotMutation(
			{ channelId: channel.channelId },
			{
				onSuccess: (result) => {
					if (result.success) {
						toast.success("Upcoming slot deleted successfully");
						refetchUpcomingSlots();
					} else {
						toast.error("Failed to delete upcoming slot");
					}
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};

	const { isMobile } = useMobile();

	const dateObj = getJapanTimeAsObject(channel.date);

	// D&D
	const [userAssignment, setUserAssignment] = useState<UserAssignment>(() => {
		const online = channel.onlineUserIds.map((userId) => {
			const user = users.find((u) => u.userId === userId);
			return {
				id: userId,
				username: user ? user.userName : "Unknown User",
				userId,
			};
		});
		const offline = channel.offlineUserIds.map((userId) => {
			const user = users.find((u) => u.userId === userId);
			return {
				id: userId,
				username: user ? user.userName : "Unknown User",
				userId,
			};
		});
		return { online, offline };
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
		if (hasOwnKey(userAssignment, userId)) return userId;

		for (const key in userAssignment) {
			if (!hasOwnKey(userAssignment, key)) continue;

			if (userAssignment[key].some((item) => item.id === userId)) {
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

		setUserAssignment((prev) => {
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
					// insert new entry
					userAssignment[activeContainer][activeIndex],
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
			const activeIndex = userAssignment[activeContainer].findIndex(
				(item) => item.id === active.id,
			);
			const overIndex = userAssignment[activeContainer].findIndex(
				(item) => item.id === over.id,
			);

			if (activeIndex !== overIndex) {
				setUserAssignment((prev) => ({
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
		isHandlingRemoveUsers,
		startHandlingRemoveUsers,
		endHandlingRemoveUsers,
		selectedRemoveUserIds,
		toggleSelectedRemoveUser,
		executeRemoveUsers,
		isDateDialogOpen,
		setIsDateDialogOpen,
		openDateDialog,
		closeDateDialog,
		selectedDate,
		setSelectedDate,
		executeDateChange,
		handleDeleteUpcomingSlot,
		loadingRemoveUsersMutation,
		loadingChangeDateMutation,
		loadingDeleteUpcomingSlotMutation,
		isMobile,
		dateObj,
		userAssignment,
		activeId,
		sensors,
		handleDragOver,
		handleDragEnd,
		setActiveId,
	};
};

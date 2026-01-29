import { PencilIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import type { UpcomingSlot } from "@/types/upcoming-slot";
import type { User } from "@/types/user";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { DatePicker } from "../../ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";
import { Spinner } from "../../ui/spinner";
import { Table, TableBody, TableCell, TableRow } from "../../ui/table";
import { UserSelectDialogButton } from "./AddUserDialogButton";
import { DeleteUpcomingSlotButton } from "./CancelUpcomingDialogButton";
import { useUpcomingCard } from "./upcomingCard.hooks";
import {
	DndContext,
	closestCorners, // Better for multi-container
	DragOverlay,
	type UniqueIdentifier,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { UserEntry, UserAssignment } from "./upcomingCard.hooks";

type UpcomingCardProps = {
	channel: UpcomingSlot;
	users: User[] | undefined;
	refetchUpcomingSlots: () => void;
};

const TableContainer = ({
	id,
	title,
	items,
}: {
	id: keyof UserAssignment;
	title: string;
	items: UserEntry[];
}) => {
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
};

const SortableRow = ({
	id,
	item,
}: {
	id: UniqueIdentifier;
	item: UserEntry;
}) => {
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
			<TableCell className="font-medium">{item.userId}</TableCell>
			<TableCell>{item.username}</TableCell>
		</TableRow>
	);
};

export const UpcomingCard = ({
	channel,
	users,
	refetchUpcomingSlots,
}: UpcomingCardProps) => {
	const {
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
	} = useUpcomingCard({
		channel,
		users: users || [],
		refetchUpcomingSlots,
	});
	const { year, month, date, day } = dateObj;
	const isInSlot = (userId: string) => {
		return (
			channel.onlineUserIds.includes(userId) ||
			channel.offlineUserIds.includes(userId)
		);
	};
	return (
		<>
			<Card key={channel.channelId} className="p-4">
				{isMobile === false ? (
					<div className="w-full flex justify-between">
						<div className="flex flex-col gap-2">
							<div className="flex flex-row items-center gap-2">
								<div className="text-xl font-semibold">
									{channel.channelName}
								</div>
								
								<DeleteUpcomingSlotButton
									onProceed={handleDeleteUpcomingSlot}
									onCancel={() => {}}
								/>
							</div>
							<div className="flex items-center gap-2">
								<div className="text-sm text-gray-500">
									{day} {date} {month} {year}
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={openDateDialog}
									className="p-1 h-auto"
								>
									<PencilIcon className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							<div className="flex gap-2">
								<UserSelectDialogButton
									channelId={channel.channelId}
									unregisteredUsers={
										users?.filter((user) => !isInSlot(user.userId)) || []
									}
									refetchChannels={refetchUpcomingSlots}
									mode="online"
								/>
								<UserSelectDialogButton
									channelId={channel.channelId}
									unregisteredUsers={
										users?.filter((user) => !isInSlot(user.userId)) || []
									}
									refetchChannels={refetchUpcomingSlots}
									mode="offline"
								/>
							</div>

							{isHandlingRemoveUsers ? (
								<div className="flex items-center gap-2 justify-end">
									<Button
										variant="destructive"
										onClick={executeRemoveUsers}
										disabled={
											loadingRemoveUsersMutation ||
											selectedRemoveUserIds.length === 0
										}
									>
										{loadingRemoveUsersMutation ? <Spinner /> : "Execute"}
									</Button>
									<Button variant="outline" onClick={endHandlingRemoveUsers}>
										Cancel
									</Button>
								</div>
							) : (
								<Button
									variant="outline"
									onClick={() => startHandlingRemoveUsers(channel.channelId)}
								>
									Remove Users
								</Button>
							)}
						</div>
					</div>
				) : (
					<div className="w-full">
						<div className="flex flex-row items-center gap-2">
							<div className="text-xl font-semibold">{channel.channelName}</div>
							
							<DeleteUpcomingSlotButton
								onProceed={handleDeleteUpcomingSlot}
								onCancel={() => {}}
							/>
						</div>
						<div className="flex items-center gap-2">
							<div className="text-sm text-gray-500">
								{day} {date} {month} {year}
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={openDateDialog}
								className="p-1 h-auto"
							>
								<PencilIcon className="h-4 w-4" />
							</Button>
						</div>
						<div className="flex items-end gap-2">
							<div className="flex gap-2">
								<UserSelectDialogButton
									channelId={channel.channelId}
									unregisteredUsers={
										users?.filter((user) => !isInSlot(user.userId)) || []
									}
									refetchChannels={refetchUpcomingSlots}
									mode="online"
								/>
								<UserSelectDialogButton
									channelId={channel.channelId}
									unregisteredUsers={
										users?.filter((user) => !isInSlot(user.userId)) || []
									}
									refetchChannels={refetchUpcomingSlots}
									mode="offline"
								/>
							</div>

							{isHandlingRemoveUsers ? (
								<div className="flex items-center gap-2 justify-end">
									<Button
										variant="destructive"
										onClick={executeRemoveUsers}
										disabled={
											loadingRemoveUsersMutation ||
											selectedRemoveUserIds.length === 0
										}
									>
										{loadingRemoveUsersMutation ? <Spinner /> : "Execute"}
									</Button>
									<Button variant="outline" onClick={endHandlingRemoveUsers}>
										Cancel
									</Button>
								</div>
							) : (
								<Button
									variant="outline"
									onClick={() => startHandlingRemoveUsers(channel.channelId)}
								>
									Remove Users
								</Button>
							)}
						</div>
					</div>
				)}

				<div className="space-y-10">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCorners} // Use corners for better detection
						onDragStart={({ active }) => setActiveId(active.id)}
						onDragOver={handleDragOver}
						onDragEnd={handleDragEnd}
					>
						<TableContainer
							id="online"
							title="Online"
							items={userAssignment.online}
						/>
						<TableContainer
							id="offline"
							title="Offline"
							items={userAssignment.offline}
						/>

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
				{/* <Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-2/3">Name</TableHead>
							<TableHead className="w-1/3">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{channel.onlineUserIds.map((userId) => {
							const user = users?.find((u) => u.userId === userId);
							return (
								<TableRow key={userId}>
									<TableCell className="bg-red-50">
										{user ? (
											<div className="flex items-center gap-2">
												<UserCircleIcon className="h-4 w-4" />
												{user.userName}
											</div>
										) : (
											<div className="flex items-center gap-2">
												<QuestionMarkCircleIcon className="h-4 w-4" />
												No user found
											</div>
										)}
									</TableCell>
									<TableCell>
										{isHandlingRemoveUsers ? (
											<Checkbox
												checked={selectedRemoveUserIds.includes(userId)}
												onCheckedChange={() => toggleSelectedRemoveUser(userId)}
											/>
										) : (
											" "
										)}
									</TableCell>
								</TableRow>
							);
						})}
            {channel.offlineUserIds.map((userId) => {
							const user = users?.find((u) => u.userId === userId);
							return (
								<TableRow key={userId}>
									<TableCell className="bg-blue-50">
										{user ? (
											<div className="flex items-center gap-2">
												<UserCircleIcon className="h-4 w-4" />
												{user.userName}
											</div>
										) : (
											<div className="flex items-center gap-2">
												<QuestionMarkCircleIcon className="h-4 w-4" />
												No user found
											</div>
										)}
									</TableCell>
									<TableCell>
										{isHandlingRemoveUsers ? (
											<Checkbox
												checked={selectedRemoveUserIds.includes(userId)}
												onCheckedChange={() => toggleSelectedRemoveUser(userId)}
											/>
										) : (
											" "
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table> */}
			</Card>

			{/* Date Edit Dialog */}
			<Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
				<DialogContent className="w-full max-w-md">
					<DialogHeader>
						<DialogTitle>Change Meeting Date</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-2">
								Current Date
							</label>
							<div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
								{day} {date} {month} {year}
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">New Date</label>
							<DatePicker date={selectedDate} setDate={setSelectedDate} />
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={closeDateDialog}
							disabled={loadingChangeDateMutation}
						>
							Cancel
						</Button>
						<Button
							variant="default"
							onClick={executeDateChange}
							disabled={loadingChangeDateMutation || !selectedDate}
						>
							{loadingChangeDateMutation ? <Spinner /> : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	PencilIcon,
	QuestionMarkCircleIcon,
	UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { getJapanTimeAsObject } from "@/lib/date";
import { useMobile } from "@/lib/useMobile";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../ui/table";
import { UserSelectDialogButton } from "./AddUserDialogButton";
import { DeleteUpcomingSlotButton } from "./CancelUpcomingDialogButton";

const _SortableRow = ({
	id,
	item,
}: {
	id: UniqueIdentifier;
	item: { name: string; status: string };
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
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<TableRow
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="cursor-grab active:cursor-grabbing"
		>
			<TableCell>{item.name}</TableCell>
			<TableCell>{item.status}</TableCell>
		</TableRow>
	);
};

export const UpcomingCard = () => {
	// dummy component for dnd example
	const _userAssignment = {
		online: ["<@U12345>", "<@U67890>"],
		offline: ["<@U54321>", "<@U09876>"],
	};
	const { isMobile } = useMobile();

	const { day, date, month, year } = getJapanTimeAsObject(
		new Date().toISOString(),
	);

	const channel = {
		channelId: "channel-1",
		channelName: "Example Channel",
		day: "MONDAY" as const,
		userIds: ["U12345", "U67890", "U54321", "U09876"],
	};

	const users = [
		{ userId: "U12345", userName: "Alice" },
		{ userId: "U67890", userName: "Bob" },
		{ userId: "U54321", userName: "Charlie" },
		{ userId: "U09876", userName: "Diana" },
	];

	return (
		<Card className="p-4">
			{isMobile === false && (
				<div className="w-full flex justify-between">
					<div className="flex flex-col gap-2">
						<div className="flex flex-row items-center gap-2">
							<div className="text-xl font-semibold">{channel.channelName}</div>
							<Badge variant="outline">{channel.day}</Badge>
							<DeleteUpcomingSlotButton
								onProceed={() => {}}
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
								onClick={() => {}}
								className="p-1 h-auto"
							>
								<PencilIcon className="h-4 w-4" />
							</Button>
						</div>
					</div>
					<div className="flex flex-col items-end gap-2">
						<UserSelectDialogButton
							channelId={channel.channelId}
							unregisteredUsers={[]}
							refetchChannels={() => {}}
						/>

						<Button variant="outline" onClick={() => {}}>
							Remove Users
						</Button>
					</div>
				</div>
			)}
			{/* {isMobile && (
					<div className="w-full">
						<div className="flex flex-row items-center gap-2">
							<div className="text-xl font-semibold">{channel.channelName}</div>
							<Badge variant="outline">{channel.day}</Badge>
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
							<UserSelectDialogButton
								channelId={channel.channelId}
								unregisteredUsers={
									users?.filter(
										(user) => !channel.userIds.includes(user.userId),
									) || []
								}
								refetchChannels={refetchChannels}
							/>

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
				)} */}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-2/3">Name</TableHead>
						<TableHead className="w-1/3">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{channel.userIds.map((userId) => {
						const user = users?.find((u) => u.userId === userId);
						return (
							<TableRow key={userId}>
								<TableCell>
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
								<TableCell>( " " )</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</Card>
	);
};

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { type Channel, channelSchema } from "@/types/channel";
import type { User } from "@/types/user";

interface ChannelDialogProps {
	isOpen: boolean;
	users: User[];
	onClose: () => void;
	refetchChannels: () => void;
}

export const ChannelDialog: React.FC<ChannelDialogProps> = ({
	isOpen,
	users,
	onClose,
	refetchChannels,
}) => {
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	const { mutate: addChannelMutation, isPending: addChannelLoading } =
		trpc.channel.add.useMutation();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<Channel>({
		resolver: zodResolver(channelSchema),
		defaultValues: {
			channelId: "",
			channelName: "",
			userIds: [],
			day: "MONDAY",
		},
	});

	const onSubmit = async (data: Channel) => {
		addChannelMutation(
			{
				channelId: data.channelId,
				channelName: data.channelName,
				userIds: selectedUserIds,
				day: data.day,
			},
			{
				onSuccess: (result) => {
					if (result.success) {
						toast.success("Channel created successfully");
						refetchChannels();
					} else {
						toast.error(result.error || "Failed to create channel");
					}
					handleClose();
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};

	const handleClose = () => {
		reset();
		setSelectedUserIds([]);
		onClose();
	};

	const handleUserSelect = (userId: string) => {
		if (!selectedUserIds.includes(userId)) {
			const newSelectedUserIds = [...selectedUserIds, userId];
			setSelectedUserIds(newSelectedUserIds);
			setValue("userIds", newSelectedUserIds);
		}
	};

	const handleRemoveUser = (userId: string) => {
		const newSelectedUserIds = selectedUserIds.filter((id) => id !== userId);
		setSelectedUserIds(newSelectedUserIds);
		setValue("userIds", newSelectedUserIds);
	};

	const getUserName = (userId: string) => {
		return users.find((user) => user.userId === userId)?.userName || userId;
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="w-full max-w-md">
				<DialogTitle className="text-lg font-bold">Create Channel</DialogTitle>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
					<div>
						<label className="block font-medium">Channel ID</label>
						<input
							{...register("channelId")}
							className={`border rounded px-2 py-1 w-full ${errors.channelId ? "border-red-500" : ""}`}
							placeholder="channel-id"
						/>
						{errors.channelId && (
							<p className="text-red-600 text-sm mt-1">
								{errors.channelId.message}
							</p>
						)}
					</div>

					<div>
						<label className="block font-medium">Channel Name</label>
						<input
							{...register("channelName")}
							className={`border rounded px-2 py-1 w-full ${errors.channelName ? "border-red-500" : ""}`}
							placeholder="Channel Name"
						/>
						{errors.channelName && (
							<p className="text-red-600 text-sm mt-1">
								{errors.channelName.message}
							</p>
						)}
					</div>

					<div>
						<label className="block font-medium">Day</label>
						<select
							{...register("day")}
							className={`border rounded px-2 py-1 w-full ${errors.day ? "border-red-500" : ""}`}
						>
							<option value="MONDAY">Monday</option>
							<option value="TUESDAY">Tuesday</option>
							<option value="WEDNESDAY">Wednesday</option>
							<option value="THURSDAY">Thursday</option>
							<option value="FRIDAY">Friday</option>
							<option value="SATURDAY">Saturday</option>
							<option value="SUNDAY">Sunday</option>
						</select>
						{errors.day && (
							<p className="text-red-600 text-sm mt-1">{errors.day.message}</p>
						)}
					</div>

					<div>
						<label className="block font-medium">Select Users</label>
						<Select value={""} onValueChange={handleUserSelect}>
							<SelectTrigger>Select users to add</SelectTrigger>
							<SelectContent>
								{users
									.filter((user) => !selectedUserIds.includes(user.userId))
									.sort((a, b) => a.userName.localeCompare(b.userName))
									.map((user) => (
										<SelectItem key={user.userId} value={user.userId}>
											{user.userName}
										</SelectItem>
									))}
							</SelectContent>
						</Select>

						{selectedUserIds.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-2">
								{selectedUserIds.map((userId) => (
									<Badge
										key={userId}
										variant="secondary"
										className="flex items-center gap-1"
									>
										{getUserName(userId)}
										<button
											type="button"
											onClick={() => handleRemoveUser(userId)}
											className="ml-1 hover:text-red-600"
										>
											<X size={12} />
										</button>
									</Badge>
								))}
							</div>
						)}
						{errors.userIds && (
							<p className="text-red-600 text-sm mt-1">
								{errors.userIds.message}
							</p>
						)}
					</div>

					<DialogFooter className="mt-4">
						<button
							type="button"
							className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
							onClick={handleClose}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
							disabled={addChannelLoading}
						>
							{addChannelLoading ? <Spinner /> : "Create"}
						</button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

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
import { type Channel, channelSchema } from "@/models/channel";

interface ChannelDialogProps {
	isOpen: boolean;
	channel: Channel;
	onClose: () => void;
	refetchChannels: () => void;
}

export const UpdateChannelDialog: React.FC<ChannelDialogProps> = ({
	isOpen,
	channel,
	onClose,
	refetchChannels,
}) => {
	const { mutate: updateChannelMutation, isPending: updateChannelLoading } =
		trpc.channel.update.useMutation();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<Pick<Channel, "channelName" | "day">>({
		resolver: zodResolver(
			channelSchema.pick({
				channelName: true,
				day: true,
			}),
		),
		defaultValues: {
			channelName: channel.channelName,
			day: channel.day,
		},
	});

	const onSubmit = async (data: Pick<Channel, "channelName" | "day">) => {
		const channelId = channel.channelId;
		updateChannelMutation(
			{
				channelId,
				channelName: data.channelName,
				day: data.day,
			},
			{
				onSuccess: (result) => {
					if (result.success) {
						toast.success("Channel updated successfully");
						refetchChannels();
					} else {
						toast.error(result.error || "Failed to update channel");
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
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="w-full max-w-md">
				<DialogTitle className="text-lg font-bold">
					Update Channel Configs
				</DialogTitle>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
					{/* channelName */}
					<div>
						<label className="block font-medium">Channel Name</label>
						<input
							{...register("channelName")}
							className={`border rounded px-2 py-1 w-full ${errors.channelName ? "border-red-500" : ""}`}
							placeholder="Channel Name"
							autoComplete="off"
						/>
						{errors.channelName && (
							<p className="text-red-600 text-sm mt-1">
								{errors.channelName.message}
							</p>
						)}
					</div>

					{/* day */}
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
							disabled={updateChannelLoading}
						>
							{updateChannelLoading ? <Spinner /> : "Update"}
						</button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

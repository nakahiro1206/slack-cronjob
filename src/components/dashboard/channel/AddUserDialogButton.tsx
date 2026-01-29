import { PlusIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import type { User } from "@/models/user";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import { Spinner } from "../../ui/spinner";

export const UserSelectDialogButton = ({
	channelId,
	unregisteredUsers,
	refetchChannels,
}: {
	channelId: string;
	unregisteredUsers: User[];
	refetchChannels: () => void;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const handleClose = () => setIsOpen(false);
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	const {
		mutate: registerUsersMutation,
		isPending: loadingRegisterUsersMutation,
	} = trpc.channel.registerUsers.useMutation();

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
		return (
			unregisteredUsers.find((user) => user.userId === userId)?.userName ||
			userId
		);
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<{ userIds: string[] }>({
		resolver: zodResolver(
			z.object({
				userIds: z.array(z.string()),
			}),
		),
		defaultValues: { userIds: [] },
	});

	const onSubmit = (data: { userIds: string[] }) => {
		registerUsersMutation(
			{
				channelId,
				userIds: data.userIds,
			},
			{
				onSuccess: (result) => {
					if (result.success) {
						toast.success("User registered successfully");
						refetchChannels();
					} else {
						toast.error("User registration failed");
					}
					handleClose();
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<PlusIcon className="h-4 w-4" /> Add User
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Register User</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-2">
						<Select value={""} onValueChange={handleUserSelect}>
							<SelectTrigger>
								<SelectValue placeholder="Select a user" />
							</SelectTrigger>
							<SelectContent>
								{unregisteredUsers
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
							disabled={loadingRegisterUsersMutation}
						>
							{loadingRegisterUsersMutation ? <Spinner /> : "Register"}
						</button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

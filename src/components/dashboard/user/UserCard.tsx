import { PlusIcon } from "@heroicons/react/24/solid";
import { CheckIcon, EllipsisVerticalIcon, XIcon } from "lucide-react";
import React, { type FC } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc/client";
import type { User } from "@/models/user";

type Props = {
	users: User[] | undefined;
	openUserDialog: () => void;
	refetchUsers: () => void;
};

const useUserCard = (refetchUsers: () => void) => {
	const [editingUserIndex, setEditingUserIndex] = React.useState<number | null>(
		null,
	);
	const editingUserNameRef = React.useRef<HTMLInputElement>(null);
	const startEditUser = (index: number) => {
		setEditingUserIndex(index);
	};

	const { mutate: updateUserMutation, isPending: updateUserLoading } =
		trpc.user.update.useMutation();
	const { mutate: deleteUserMutation, isPending: deleteUserLoading } =
		trpc.user.delete.useMutation();

	const handleUpdateUser = async (input: { id: string; name: string }) => {
		updateUserMutation(input, {
			onSuccess: (result) => {
				if (result.success) {
					toast.success("User updated successfully");
				} else {
					toast.error("Failed to update user");
				}
				refetchUsers();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	};

	const handleDeleteUser = async (userId: string) => {
		deleteUserMutation(
			{ id: userId },
			{
				onSuccess: (result) => {
					if (result.success) {
						toast.success("User deleted successfully");
					} else {
						toast.error("Failed to delete user");
					}
					refetchUsers();
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};

	return {
		editingUserIndex,
		setEditingUserIndex,
		editingUserNameRef,
		startEditUser,
		handleUpdateUser,
		handleDeleteUser,
	};
};

export const UserCard: FC<Props> = ({
	users,
	openUserDialog,
	refetchUsers,
}) => {
	const {
		editingUserIndex,
		setEditingUserIndex,
		editingUserNameRef,
		startEditUser,
		handleUpdateUser,
		handleDeleteUser,
	} = useUserCard(refetchUsers);

	const AutoClosePopover = (input: { userIndex: number; userId: string }) => {
		const [isOpen, setIsOpen] = React.useState(false);
		const { userIndex } = input;
		return (
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="icon">
						<EllipsisVerticalIcon className="h-5 w-5" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<div className="flex flex-col space-y-2">
						<Button
							variant="ghost"
							className="justify-start"
							onClick={() => {
								startEditUser(userIndex);
								setIsOpen(false);
							}}
						>
							Edit User
						</Button>
						<Button
							variant="ghost"
							className="justify-start text-red-600"
							onClick={() => {
								handleDeleteUser(input.userId);
								setIsOpen(false);
							}}
						>
							Delete User
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		);
	};
	return (
		<Card className="p-4">
			<div className="flex items-center justify-between mb-2">
				<div className="text-xl font-semibold mb-2">All Users</div>
				<Button variant="outline" onClick={openUserDialog}>
					<PlusIcon className="h-4 w-4" /> Create User
				</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users?.map((user, userIndex) => (
						<TableRow key={user.userId}>
							<TableCell>{user.userId}</TableCell>
							<TableCell>
								{editingUserIndex === userIndex ? (
									<input
										ref={editingUserNameRef}
										className="border rounded px-2 py-1 w-full"
										defaultValue={user.userName}
									/>
								) : (
									user.userName
								)}
							</TableCell>
							<TableCell>
								{editingUserIndex === userIndex ? (
									<div className="flex space-x-2">
										<Button
											variant="ghost"
											className="text-green-600"
											onClick={() => {
												if (editingUserNameRef.current) {
													const newName = editingUserNameRef.current.value;
													handleUpdateUser({ id: user.userId, name: newName });
												}
												setEditingUserIndex(null);
											}}
										>
											<CheckIcon className="h-5 w-5" />
										</Button>
										<Button
											variant="ghost"
											className="text-red-600"
											onClick={() => {
												setEditingUserIndex(null);
											}}
										>
											<XIcon className="h-5 w-5" />
										</Button>
									</div>
								) : (
									<AutoClosePopover
										userIndex={userIndex}
										userId={user.userId}
									/>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
};

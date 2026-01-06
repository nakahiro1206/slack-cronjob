"use client";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";

interface UserDialogProps {
	isOpen: boolean;
	onClose: () => void;
	refetchUsers: () => void;
}

const useUserDialog = (refetchUsers: () => void, onClose: () => void) => {
	const [newUserId, setNewUserId] = useState("");
	const [newUserName, setNewUserName] = useState("");
	const { mutate: addUserMutation, isPending: addUserLoading } =
		trpc.user.add.useMutation();

	const handleCreateUser = async () => {

		addUserMutation(
			{
				id: newUserId,
				name: newUserName,
				url: null,
			},
			{
				onSuccess: (result) => {
					if (result.success) {
						toast.success("User created successfully");
					} else {
						toast.error("Failed to create user");
					}
					refetchUsers();
					handleClose();
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	};

	const handleClose = () => {
		setNewUserId("");
		setNewUserName("");
		onClose();
	};

	return {
		newUserId,
		setNewUserId,
		newUserName,
		setNewUserName,
		addUserLoading,
		handleCreateUser,
		handleClose,
	};
};

export const UserDialog: React.FC<UserDialogProps> = ({
	isOpen,
	onClose,
	refetchUsers,
}) => {
	const {
		newUserId,
		setNewUserId,
		newUserName,
		setNewUserName,
		addUserLoading,
		handleCreateUser,
		handleClose,
	} = useUserDialog(refetchUsers, onClose);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="w-full max-w-md">
				<DialogTitle className="text-lg font-bold">Create User</DialogTitle>
				<div className="space-y-3">
					<div>
						<label className="block font-medium">User ID</label>
						<input
							className="border rounded px-2 py-1 w-full"
							value={newUserId}
							onChange={(e) => setNewUserId(e.target.value)}
							placeholder="user-id"
						/>
					</div>
					<div>
						<label className="block font-medium">User Name</label>
						<input
							className="border rounded px-2 py-1 w-full"
							value={newUserName}
							onChange={(e) => setNewUserName(e.target.value)}
							placeholder="User Name"
						/>
					</div>
				</div>
				<DialogFooter className="mt-4">
					<button
						className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
						onClick={handleClose}
					>
						Cancel
					</button>
					<button
						className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
						onClick={handleCreateUser}
						disabled={addUserLoading}
					>
						{addUserLoading ? <Spinner /> : "Create"}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

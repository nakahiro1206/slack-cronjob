import { z } from "zod";
import {
	addUser as addUserFirebase,
	deleteUser as deleteUserFirebase,
	getUsers as getUsersFirebase,
	updateUser as updateUserFirebase,
} from "@/lib/firebase/user";
import { publicProcedure, router } from "../server";

export const userRouter = router({
	// Get all users
	getAll: publicProcedure.query(async () => {
		const getUsersResult = await getUsersFirebase();
		return getUsersResult.match(
			(users) =>
				users.map((user) => ({
					id: user.userId,
					name: user.userName,
				})),
			(error) => {
				console.error("Failed to get users:", error);
				return [];
			},
		);
	}),

	// Add a new user
	add: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const addUserResult = await addUserFirebase({
				userId: input.id,
				userName: input.name,
			});
			return addUserResult.match<{
				success: boolean;
			}>(
				() => {
					return {
						success: true,
					};
				},
				(error) => {
					console.error("Failed to add user:", error);
					return {
						success: false,
					};
				},
			);
		}),

	// update User
	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const updateUserResult = await updateUserFirebase({
				userId: input.id,
				userName: input.name,
			});
			return updateUserResult.match<{
				success: boolean;
			}>(
				() => {
					return {
						success: true,
					};
				},
				(error) => {
					console.error("Failed to update user:", error);
					return {
						success: false,
					};
				},
			);
		}),

	// delete User
	delete: publicProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const deleteUserResult = await deleteUserFirebase(input.id);
			return deleteUserResult.match<{
				success: boolean;
			}>(
				() => {
					return {
						success: true,
					};
				},
				(error) => {
					console.error("Failed to delete user:", error);
					return {
						success: false,
					};
				},
			);
		}),
});

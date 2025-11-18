import { z } from "zod";
import { publicProcedure, router } from "../server";
import { userService } from "@/server/application/container";

export const userRouter = router({
	// Get all users
	getAll: publicProcedure.query(async () => {
		return await userService.getAllUsers();
	}),

	// Add a new user
	add: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				url: z.string().or(z.undefined()),
			}),
		)
		.mutation(async ({ input }) => {
			return await userService.addUser(input);
		}),

	// update User
	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				url: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			return await userService.updateUser(input);
		}),

	// delete User
	delete: publicProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			return await userService.deleteUser(input.id);
		}),
});

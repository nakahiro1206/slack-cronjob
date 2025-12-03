import { z } from "zod";
// import {
// 	changeData,
// 	deleteUpcomingSlot,
// 	getUpcomingSlots,
// 	initializeUpcomingSlots,
// 	registerUsers,
// 	removeUsers,
// } from "@/lib/firebase/upcoming";
import { upcomingSlotService } from "@/server/application/container";
import { publicProcedure, router } from "../server";

export const upcomingRouter = router({
	// Get all upcoming events
	getAll: publicProcedure.query(async () => {
		return await upcomingSlotService.getUpcomingSlots();
	}),

	initialize: publicProcedure.mutation(async () => {
		return await upcomingSlotService.initializeUpcomingSlots();
	}),

	delete: publicProcedure
		.input(
			z.object({
				channelId: z.string().min(1),
			}),
		)
		.mutation(async ({ input }) => {
			return await upcomingSlotService.deleteUpcomingSlot(input.channelId);
		}),

	// Register users to a channel
	registerUsers: publicProcedure
		.input(
			z.object({
				channelId: z.string().min(1),
				userIds: z.array(z.string()),
			}),
		)
		.mutation(async ({ input }) => {
			return await upcomingSlotService.registerUsersToChannel(
				input.channelId,
				input.userIds,
			);
		}),

	removeUsers: publicProcedure
		.input(
			z.object({
				channelId: z.string().min(1),
				userIds: z.array(z.string()),
			}),
		)
		.mutation(async ({ input }) => {
			return await upcomingSlotService.removeUsersFromChannel(
				input.channelId,
				input.userIds,
			);
		}),

	changeDate: publicProcedure
		.input(
			z.object({
				channelId: z.string().min(1),
				date: z.string().min(1),
			}),
		)
		.mutation(async ({ input }) => {
			return await upcomingSlotService.changeDate(input.channelId, input.date);
		}),
});

import { z } from "zod";
import { dayEnum } from "@/models/channel";
import { publicProcedure, router } from "../server";
import { channelService } from "@/server/application/container";

export const channelRouter = router({
	// Get all channels
	getAll: publicProcedure.query(async () => {
		return await channelService.getAllChannels();
	}),

	// Add a new channel
	add: publicProcedure
		.input(
			z.object({
				channelId: z.string().min(1),
				channelName: z.string().min(1),
				day: dayEnum,
				userIds: z.array(z.string()),
			}),
		)
		.mutation(async ({ input }) => {
			return await channelService.addChannel(input);
		}),

	// update Channe;
	update: publicProcedure
		.input(
			z.object({
				channelId: z.string().min(1),
				channelName: z.string().min(1),
				day: dayEnum,
			}),
		)
		.mutation(async ({ input }) => {
			return await channelService.updateChannel(input);
		}),

	// delete Channel
	delete: publicProcedure
		.input(
			z.object({
				channelId: z.string().min(1),
			}),
		)
		.mutation(async ({ input }) => {
			return await channelService.deleteChannel(input.channelId);
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
			return await channelService.registerUsers(
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
			return await channelService.removeUsers(
				input.channelId,
				input.userIds,
			);
		}),
});

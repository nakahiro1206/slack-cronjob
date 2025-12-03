import { z } from "zod";
import { notificationService } from "@/server/application/container";
import { publicProcedure, router } from "../server";

export const cronjobRouter = router({
	// Get cronjob secret
	getSecret: publicProcedure.query(async () => {
		return process.env.CRON_SECRET || "";
	}),

	// Send notifications
	testNotify: publicProcedure
		.input(
			z.object({
				channelIds: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const notifyResult = await notificationService.notifyToSpecifiedChannels(
				input.channelIds || [],
			);
			return {
				success: notifyResult.success,
				message: notifyResult.message,
			};
		}),
});

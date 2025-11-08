import { z } from "zod";
import { notify as notifyService } from "@/lib/slack/notify";
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
			const notifyResult = await notifyService({
				mode: "specifiedChannels",
				channelIds: input.channelIds || [],
				updateSlot: false, //  In test mode, do not update slots
			});
			return {
				success: notifyResult.success,
				message: notifyResult.message,
			};
		}),
});

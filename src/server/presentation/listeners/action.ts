import type {
	AllMiddlewareArgs,
	BlockAction,
	SlackActionMiddlewareArgs,
} from "@slack/bolt";
import type { App } from "@slack/bolt";
import { upcomingSlotService } from "@/server/application/container";

export const register = (app: App) => {
	app.action(
		"toggle_1on1_progress",
		async ({
			ack,
			client,
			body,
			logger,
		}: AllMiddlewareArgs & SlackActionMiddlewareArgs<BlockAction>) => {
			try {
				await ack();
				if (
					body.type !== "block_actions" ||
					!body.channel?.id ||
					!body.message?.ts
				) {
					return;
				}

				const userId = body.user.id;
				const channelId = body.channel.id;
				const messageTs = body.message.ts;
				const _action = body.actions[0];

        // Update the 1on1 progress status in the data store
        // await upcomingSlotService.

				// Toggle the state and post update
				const statusText = "toggled 1on1 progress";

				await client.chat.postMessage({
					channel: channelId,
					thread_ts: messageTs,
					text: `<@${userId}> ${statusText}`,
				});
			} catch (error) {
				logger.error(error);
			}
		},
	);
};

import type {
	AllMiddlewareArgs,
	BlockAction,
	SlackActionMiddlewareArgs,
} from "@slack/bolt";
import type { App } from "@slack/bolt";
import { workspaceService } from "@/server/application/container";

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

				const res = await workspaceService.toggleProgress(
					userId,
					channelId,
					messageTs,
				);
				if (res.isErr()) {
					logger.error("Error toggling 1on1 progress:", res.error);
					console.error("Error toggling 1on1 progress:", res.error);
					return;
				}
			} catch (error) {
				logger.error(error);
			}
		},
	);
};

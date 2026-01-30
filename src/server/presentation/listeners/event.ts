import type { App } from "@slack/bolt";
import { slackAuthMiddleWare } from "@/server/presentation/slack-auth-middleware";
import { waitUntil } from "@vercel/functions";
import { notificationService } from "@/server/application/container";

const register = (app: App) => {
	app.event("app_mention", async ({ event, client, logger }) => {
		const _res = await client.conversations.replies({
			channel: event.channel,
			ts: event.ts,
			limit: 1,
		});
		// res.messages?.map((message) => {
		// 	logger.info(`App mention message: ${message.blocks?.map((b) => b.elements?.map((e) => e.elements)).join(", ") ).join(", ")}`);
		// });
		const botIdResult = await slackAuthMiddleWare.getBotId();
		if (botIdResult.isErr()) {
			logger.error("Failed to get bot user ID:", botIdResult.error);
			return;
		}
		const botUserId = botIdResult.unwrap();

		// Skip if this is a bot message
		if (event.bot_id || event.bot_id === botUserId || event.bot_profile) {
			logger.info("Skipping bot message because it was posted by a bot");
			return;
		}

		if (event.thread_ts === undefined) {
			console.log("Not in a thread, handling as new message");
			waitUntil(
				notificationService.notifyNewMessageToChannel(
					event.channel,
					event.text,
					botUserId,
				),
			);
			return;
		}

		const { thread_ts, channel } = event;
		console.log("Handling app mention in thread:");
		const updateFn = async () => {
			const result = await notificationService.updateRootMessageOfThread(
				channel,
				thread_ts,
				event.text,
				botUserId,
			);
			result.match(
				(_ok) => {
					logger.info("Successfully updated root message of thread");
				},
				(err) => {
					logger.error("Failed to update root message of thread:", err);
				},
			);
		};
		waitUntil(updateFn());
		logger.info("Handled app mention in thread");
	});

	app.event("user_huddle_changed", async ({ event, logger }) => {
		if (event.type === "user_huddle_changed") {
			const user = event.user;
			const userId = user.id;
			const username = user.name;
			const isInHuddle = user.profile.huddle_state === "in_a_huddle";
			logger.info(
				`User huddle changed: ${username} (${userId}) is now ${
					isInHuddle ? "in a huddle" : "not in a huddle"
				}`,
			);
		}
	});
};

export { register };

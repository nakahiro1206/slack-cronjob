import type { SlackEvent } from "@slack/web-api";
import { waitUntil } from "@vercel/functions";
import { getBotId, verifyRequest } from "@/lib/slack/utils";
import { notificationService } from "../application/notification-service";

export async function slackEventPresentation(
	request: Request,
): Promise<Response> {
	const rawBody = await request.text();
	const payload = JSON.parse(rawBody);
	const requestType = payload.type as "url_verification" | "event_callback";

	// See https://api.slack.com/events/url_verification
	if (requestType === "url_verification") {
		return new Response(payload.challenge, { status: 200 });
	}

	await verifyRequest({ requestType, request, rawBody });

	try {
		const botUserId = await getBotId();

		const event = payload.event as SlackEvent;

		if (event.type === "app_mention") {
			// waitUntil(handleAppMention(event, botUserId));
			console.log("Handling app mention");

			// Skip if this is a bot message
			if (event.bot_id || event.bot_id === botUserId || event.bot_profile) {
				console.log("Skipping bot message");
				return new Response("Skipped because the message was posted by Bot", {
					status: 200,
				});
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
				return new Response("Successfully initialized order!", { status: 200 });
			}

			const { thread_ts, channel } = event;
			console.log("Handling app mention in thread:");
			waitUntil(
				notificationService.updateRootMessageOfThread(
					channel,
					thread_ts as string,
					event.text,
					botUserId,
				),
			);
			return new Response("Successfully updated order!", { status: 200 });
		}

		// if (event.type === "assistant_thread_started") {
		//     // An App Agent thread was started
		//     waitUntil(assistantThreadMessage(event));
		// }

		// if (
		//     event.type === "message" &&
		//     !event.subtype &&
		//     event.channel_type === "im" &&
		//     !event.bot_id &&
		//     !event.bot_profile &&
		//     event.bot_id !== botUserId
		// ) {
		//     // A message was posted in a direct message channel
		//     waitUntil(handleNewAssistantMessage(event, botUserId));
		// }

		return new Response("The trigger did not include app_mention", {
			status: 200,
		});
	} catch (error) {
		console.error("Error generating response", error);
		return new Response("Error generating response", { status: 500 });
	}
}

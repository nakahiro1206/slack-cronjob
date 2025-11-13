import type { SlackEvent } from "@slack/web-api";
import { waitUntil } from "@vercel/functions";
import { handleAppMention } from "@/lib/slack/handle-app-mension";
import { getBotId, verifyRequest } from "@/lib/slack/utils";
import { notificationService } from "../application/notification-service";

export async function slackEventPresentation(request: Request) {
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
			console.log("Handling app mention in thread");

			// Skip if this is a bot message
			if (event.bot_id || event.bot_id === botUserId || event.bot_profile) {
				console.log("Skipping bot message");
				return;
			}

			if (event.thread_ts === undefined) {
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
			// const updateMessage = await updateStatusInThreadUtil("is thinking...", event);

			// try {
			//         // Get the full thread context
			//         const messages = await getThread(channel, thread_ts, botUserId);
			//         // console.log("messages", messages);
			//         console.log("bot user id", botUserId);
			//         if (messages.length > 1) {
			//             const firstMessage = messages[0];
			//             const firstMessageTopLeftContent = extractTopLeftContent(
			//                 firstMessage.blocks || [],
			//             );
			//             const firstMessageMainContent = extractMainContent(
			//                 firstMessage.blocks || [],
			//             );
			//             const lastMessage = messages[messages.length - 1];
			//             console.log("The first message is from the bot. updating it");
			//             // update the first message
			//             await updateMessageInChannel({
			//                 channel,
			//                 title: firstMessageTopLeftContent,
			//                 timestamp: firstMessage.ts as string,
			//                 messages: undefined, // show loading state
			//             });

			//             console.log("lastMessage", lastMessage);

			//             const queries: MessageParam[] = [
			//                 {
			//                     role: "assistant",
			//                     content: "User IDs: "+ JSON.stringify(firstMessageMainContent),
			//                 },
			//                 {
			//                     role: "user",
			//                     content: removeBotUserIdTag(lastMessage.text, botUserId),
			//                 },
			//             ];

			//             console.log("queries", queries);
			//             // update the message with the LLM's response
			//             await updateMessageInChannel({
			//                 channel,
			//                 title: firstMessageTopLeftContent,
			//                 timestamp: firstMessage.ts as string,
			//                 messages: queries,
			//             });
			//             return;
			//         }

			//         console.log("Successfully handled app mention in thread");
			//     } catch (error) {
			//         console.error("Error handling app mention in thread:", error);
			//     }
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

		return new Response("Success!", { status: 200 });
	} catch (error) {
		console.error("Error generating response", error);
		return new Response("Error generating response", { status: 500 });
	}
}

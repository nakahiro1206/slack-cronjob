import type { SlackEvent } from "@slack/web-api";
import {
  assistantThreadMessage,
  handleNewAssistantMessage,
} from "@/lib/ai-sdk/handle-messages";
import { waitUntil } from "@vercel/functions";
// import { handleNewAppMention } from "@/lib/ai-sdk/handle-app-mension";
// import { handleNewAppMentionPost } from "@/lib/ai-sdk/handle-app-mension-post";
import { handleAppMentionInThread } from "@/lib/ai-sdk/handle-app-mension-in-thread";
import { verifyRequest, getBotId } from "@/lib/ai-sdk/slack-utils";

export async function POST(request: Request) {
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
      waitUntil(handleAppMentionInThread(event, botUserId));
    //   waitUntil(handleNewAppMentionPost(event, botUserId));
    }

    if (event.type === "assistant_thread_started") {
      // An App Agent thread was started
      waitUntil(assistantThreadMessage(event));
    }

    if (
      event.type === "message" &&
      !event.subtype &&
      event.channel_type === "im" &&
      !event.bot_id &&
      !event.bot_profile &&
      event.bot_id !== botUserId
    ) {
      // A message was posted in a direct message channel
      waitUntil(handleNewAssistantMessage(event, botUserId));
    }

    return new Response("Success!", { status: 200 });
  } catch (error) {
    console.error("Error generating response", error);
    return new Response("Error generating response", { status: 500 });
  }
}
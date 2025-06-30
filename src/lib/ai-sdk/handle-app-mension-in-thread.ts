import { AppMentionEvent } from "@slack/web-api";
import { client, getThread } from "./slack-utils";
import { generateResponse } from "./generate-response";

const updateStatusUtil = async (
  initialStatus: string,
  event: AppMentionEvent,
) => {
  // For thread mentions, we always post in the thread
  const initialMessage = await client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.thread_ts ?? event.ts,
    text: initialStatus,
  });

  if (!initialMessage || !initialMessage.ts)
    throw new Error("Failed to post initial message");

  const updateMessage = async (status: string) => {
    await client.chat.update({
      channel: event.channel,
      ts: initialMessage.ts as string,
      text: status,
    });
  };
  return updateMessage;
};

export async function handleAppMentionInThread(
  event: AppMentionEvent,
  botUserId: string,
) {
  console.log("Handling app mention in thread");
  
  // Skip if this is a bot message
  if (event.bot_id || event.bot_id === botUserId || event.bot_profile) {
    console.log("Skipping bot message");
    return;
  }

  // Ensure this is actually in a thread
  if (!event.thread_ts) {
    console.log("Not in a thread, skipping");
    return;
  }

  const { thread_ts, channel } = event;
  const updateMessage = await updateStatusUtil("is thinking...", event);

  try {
    // Get the full thread context
    const messages = await getThread(channel, thread_ts, botUserId);
    
    // Generate response with full thread context
    const result = await generateResponse(messages, updateMessage);
    
    // Update with final response
    await updateMessage(result);
    
    console.log("Successfully handled app mention in thread");
  } catch (error) {
    console.error("Error handling app mention in thread:", error);
    
    // Update with error message
    await updateMessage("Sorry, I encountered an error while processing your request. error details: " + error);
  }
} 
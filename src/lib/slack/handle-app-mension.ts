import { AppMentionEvent } from "@slack/web-api";
import { client, getThread, removeBotUserIdTag } from "./utils";
import { extractMainContent, extractTopLeftContent } from "./schema";
import { 
  postMessageToChannel,
  updateMessageInChannel,
  type MessageParam
} from "./service-custom-message";

const updateStatusInThreadUtil = async (
  initialStatus: string,
  event: AppMentionEvent,
) => {
  // For thread mentions, we always post in the thread
  const initialMessage = await client.chat.postMessage({
    channel: event.channel,
    // if you ommit thread_ts, the message will be posted in the channel
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

const updateStatusInChannelUtil = async (
  initialStatus: string,
  event: AppMentionEvent,
) => {
  // For thread mentions, we always post in the thread
  const initialMessage = await client.chat.postMessage({
    channel: event.channel,
    // if you ommit thread_ts, the message will be posted in the channel
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

export async function handleAppMention(
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
  if (event.thread_ts === undefined) {
    console.log("Not in a thread. creating a mock-up message in channel");
    const queries: MessageParam[] = [{
      role: "user",
      content: removeBotUserIdTag(event.text, botUserId),
    }];
    const initialMessage = await postMessageToChannel({
      channel: event.channel,
      messages: queries,
    });

    if (!initialMessage || !initialMessage.ts)
      throw new Error("Failed to post initial message");
    return;
  }

  const { thread_ts, channel } = event;
  // const updateMessage = await updateStatusInThreadUtil("is thinking...", event);

  try {
    // Get the full thread context
    const messages = await getThread(channel, thread_ts, botUserId);
    // console.log("messages", messages);
    console.log("bot user id", botUserId);
    if (messages.length > 1) {
      const firstMessage = messages[0];
      const firstMessageTopLeftContent = extractTopLeftContent(firstMessage.blocks || [])
      const firstMessageMainContent = extractMainContent(firstMessage.blocks || [])
      const lastMessage = messages[messages.length - 1];
      console.log("The first message is from the bot. updating it");
      // update the first message
      await updateMessageInChannel({
        channel, 
        title: firstMessageTopLeftContent, 
        timestamp: firstMessage.ts as string,
        messages: undefined, // show loading state
      });

      console.log("lastMessage", lastMessage);

      const queries: MessageParam[] = [{
        role: "assistant",
        content: firstMessageMainContent,
      }, {
        role: "user",
        content: removeBotUserIdTag(lastMessage.text, botUserId),
      }]

      console.log("queries", queries);
      // update the message with the LLM's response
      await updateMessageInChannel({
        channel, 
        title: firstMessageTopLeftContent, 
        timestamp: firstMessage.ts as string,
        messages: queries,
      });
      return;
    }
    
    console.log("Successfully handled app mention in thread");
  } catch (error) {
    console.error("Error handling app mention in thread:", error);
  }
} 
import { AppMentionEvent } from "@slack/web-api";
import { client, getThread, removeBotUserIdTag } from "./slack-utils";
import { generateResponse } from "./generate-response";
import { createSlackMessageBlocks, extractMainContent, extractTextFromBlocks, extractTopLeftContent } from "../slack/message";
import { getJapanTimeAsObject } from "../date";
import { CoreMessage } from "ai";

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
  if (!event.thread_ts) {
    console.log("Not in a thread. creating a mock-up message in channel");
    // For thread mentions, we always post in the thread
    const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
    const initialMessage = await client.chat.postMessage({
      channel: event.channel,
      // if you ommit thread_ts, the message will be posted in the channel
      text: "mock-up message in channel",
      blocks: createSlackMessageBlocks({
        top: {
          left: `*📣 Mockup 1on1 order* \n You can use this message to debug the bot.`,
          right: `*⏰ Created at(UTC+9):*\n ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${day}, ${month} ${date}, ${year}`,
        },
        mainContent: `*📋 Offline Order:*\n${["some", "users", "here"].map(userId => `- <@${userId}>`).join('\n')}`,
        bottomContent: "Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
      }),
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
      const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
      await client.chat.update({
        channel: event.channel,
        ts: firstMessage.ts as string,
        text: 'updated by the bot',
        blocks: createSlackMessageBlocks({
          top: {
            left: firstMessageTopLeftContent,
            right: `*⏰ Updated at(UTC+9):*\n ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${day}, ${month} ${date}, ${year}`,
          },
          mainContent: "is updating...",
          bottomContent: "Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
        }),
      });

      console.log("lastMessage", lastMessage);

      const queries: CoreMessage[] = [{
        role: "assistant",
        content: firstMessageMainContent,
      }, {
        role: "user",
        content: removeBotUserIdTag(lastMessage.text, botUserId),
      }]

      console.log("queries", queries);

      const result = await generateResponse(queries, () => {}); // updateMessage);

      await client.chat.update({
        channel: event.channel,
        ts: firstMessage.ts as string,
        text: "updated by the bot",
        blocks: createSlackMessageBlocks({
          top: {
            left: firstMessageTopLeftContent,
            right: `*⏰ Updated at(UTC+9):*\n ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${day}, ${month} ${date}, ${year}`,
          },
          mainContent: result,
          bottomContent: "Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
        }),
      });
      return;
    }
    
    console.log("Successfully handled app mention in thread");
  } catch (error) {
    console.error("Error handling app mention in thread:", error);
  }
} 
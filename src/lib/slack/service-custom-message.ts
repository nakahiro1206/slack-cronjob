import { client } from "./utils";
import { generateResponse } from "../ai-utils/generate-response";
import { createSlackMessageBlocks } from "./schema";
import { getJapanTimeAsObject } from "../date";

// this is the service layer: in/out should be domain models, not slack models
// for better practice, I should move this slack-specific code to another repository file

export type MessageParam = {
  role: "user" | "assistant";
  content: string;
}

const postMockResponseToChannel = async (channel: string) => {
    // For thread mentions, we always post in the thread
    const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
    const initialMessage = await client.chat.postMessage({
      channel: channel,
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

    return initialMessage;
}

export const postMessageToChannel = async (input: {
    channel: string, messages: MessageParam[] | undefined
}) => {
    const { channel, messages} = input;
    // For thread mentions, we always post in the thread
    const { hour, minute, date, day, month, year } = getJapanTimeAsObject();

    const post = async (input: {title: string, content: string}) => {
        const initialMessage = await client.chat.postMessage({
        channel: channel,
        // if you ommit thread_ts, the message will be posted in the channel
        text: "message in channel",
        blocks: createSlackMessageBlocks({
            top: {
                left: input.title,
                right: `*⏰ Created at(UTC+9):*\n ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${day}, ${month} ${date}, ${year}`,
            },
            mainContent: input.content,
            bottomContent: "Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
        }),
        });
        return initialMessage;
    }

    if (messages === undefined || messages.length === 0) {
        const initialMessage = await post({
            title: `*📣 Mockup 1on1 order* \n You can use this message to debug the bot.`,
            content: `*📋 Offline Order:*\n${["some", "users", "here"].map(userId => `- <@${userId}>`).join('\n')}`
        });
        return initialMessage;
    }

    const result = await generateResponse(messages, () => {});
    const initialMessage = await post({
        title: `*📣 1on1 order* \n This order is for the meeting on ${day}, ${month} ${date}, ${year}.`,
        content: result
    });
    return initialMessage;
}

export const updateMessageInChannel = async (input: {
    channel: string, title: string, timestamp: string, messages: MessageParam[] | undefined
}) => {
    const { channel, title, timestamp, messages} = input;
    const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
    const post = async (content: string) => {
        await client.chat.update({
            channel: channel,
            ts: timestamp,
            text: 'updated by the bot',
            blocks: createSlackMessageBlocks({
            top: {
                left: title,
                right: `*⏰ Updated at(UTC+9):*\n ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${day}, ${month} ${date}, ${year}`,
            },
            mainContent: content,
            bottomContent: "Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
            }),
        });
    }
    if (messages === undefined || messages.length === 0) {
        await post("is updating...");
        return;
    }
    const result = await generateResponse(messages, () => {});
    await post(result);
}

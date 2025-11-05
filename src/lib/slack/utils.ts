import { WebClient } from '@slack/web-api';
import { PurpleBlock } from '@slack/web-api/dist/response/ConversationsHistoryResponse';
import crypto from 'crypto'

const signingSecret = process.env.SLACK_SIGNING_SECRET!

export const client = new WebClient(process.env.SLACK_BOT_TOKEN);

// See https://api.slack.com/authentication/verifying-requests-from-slack
export async function isValidSlackRequest({
  request,
  rawBody,
}: {
  request: Request
  rawBody: string
}) {
  // console.log('Validating Slack request')
  const timestamp = request.headers.get('X-Slack-Request-Timestamp')
  const slackSignature = request.headers.get('X-Slack-Signature')
  // console.log(timestamp, slackSignature)

  if (!timestamp || !slackSignature) {
    console.log('Missing timestamp or signature')
    return false
  }

  // Prevent replay attacks on the order of 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 60 * 5) {
    console.log('Timestamp out of range')
    return false
  }

  const base = `v0:${timestamp}:${rawBody}`
  const hmac = crypto
    .createHmac('sha256', signingSecret)
    .update(base)
    .digest('hex')
  const computedSignature = `v0=${hmac}`

  // Prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(slackSignature)
  )
}

export const verifyRequest = async ({
  requestType,
  request,
  rawBody,
}: {
  requestType: string;
  request: Request;
  rawBody: string;
}) => {
  const validRequest = await isValidSlackRequest({ request, rawBody });
  if (!validRequest || requestType !== "event_callback") {
    return new Response("Invalid request", { status: 400 });
  }
};

export const updateStatusUtil = (channel: string, thread_ts: string) => {
  return async (status: string) => {
    await client.assistant.threads.setStatus({
      channel_id: channel,
      thread_ts: thread_ts,
      status: status,
    });
  };
};

// This function is used to get the thread of a message
// The response includes the first message connected to the thread
export async function getThread(
  channel_id: string,
  thread_ts: string,
  botUserId: string,
): Promise<{
  role: "assistant" | "user",
  ts: string | undefined,
  isBot: boolean,
  botId: string | undefined,
  appId: string | undefined,
  user: string | undefined,
  text: string,
  blocks: PurpleBlock[] | undefined,
}[]> {
  const { messages } = await client.conversations.replies({
    channel: channel_id,
    ts: thread_ts,
    limit: 50,
  });

  // Ensure we have messages

  if (!messages) throw new Error("No messages found in thread");

  const result = messages
    .map((message) => {
      const ts = message.ts;// can update the 1st message with this!
      const isBot = !!message.bot_id;
      if (!message.text) return null;

      // For app mentions, remove the mention prefix
      // For IM messages, keep the full text
      let content = message.text;
      if (!isBot && content.includes(`<@${botUserId}>`)) {
        content = content.replace(`<@${botUserId}> `, "");
      }

      const msg: {
        role: "assistant" | "user",
        ts: string | undefined,
        isBot: boolean,
        appId: string | undefined,
        botId: string | undefined,
        user: string | undefined,
        text: string,
        blocks: PurpleBlock[] | undefined,
      } = {
        role: isBot ? "assistant" : "user",
        ts: ts,
        isBot: isBot,
        appId: message.app_id,
        user: message.user,
        botId: isBot ? message.bot_id : undefined,
        text: message.text,
        blocks: message.blocks,
      }
      return msg;
    })
    .filter((msg) => msg !== null);

  return result;
}

export const getBotId = async () => {
  const { user_id: botUserId } = await client.auth.test();

  if (!botUserId) {
    throw new Error("botUserId is undefined");
  }
  return botUserId;
};

export const removeBotUserIdTag = (text: string, botUserId: string) => {
  console.log("text", text);
  console.log("botUserId", botUserId);
  return text.replace(`<@${botUserId}>`, "");
}
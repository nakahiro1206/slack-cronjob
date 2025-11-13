import { Result, Ok, Err } from "@/lib/result";
import {
	MessageParam,
	MessengerRepositoryInterface,
	UserTagsAssignment,
} from "@/server/application/interfaces";
import { WebClient } from "@slack/web-api";
// import type { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import { ThreadMessage } from "@/server/application/interfaces";
import { User } from "@/models/user";
import { createSlackMessageBlocks } from "@/lib/slack/schema";

type GetThreadMessagesReturn = ThreadMessage[];

export class MessengerRepository implements MessengerRepositoryInterface {
	private client: WebClient;
	constructor() {
		this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
	}

    async getBotUserId() {
        const { user_id: botUserId } = await this.client.auth.test();
    
        if (!botUserId) {
            throw new Error("botUserId is undefined");
        }
        return botUserId;
    };

	async getThreadMessages(
		channelId: string,
		threadTs: string,
	): Promise<Result<GetThreadMessagesReturn, Error>> {
        const botUserId = await this.getBotUserId();

		const { messages } = await this.client.conversations.replies({
			channel: channelId,
			ts: threadTs,
			limit: 50,
		});

		// Ensure we have messages

		if (!messages) return Err(new Error("No messages found in thread"));

		const result = messages
			.map((message) => {
				const ts = message.ts; // can update the 1st message with this!
				const isBot = !!message.bot_id;
				if (!message.text) return null;

				// For app mentions, remove the mention prefix
				// For IM messages, keep the full text
				let content = message.text;
				if (!isBot && content.includes(`<@${botUserId}>`)) {
					content = content.replace(`<@${botUserId}> `, "");
				}

				const msg: ThreadMessage = {
					role: isBot ? "assistant" : "user",
					ts: ts,
					isBot: isBot,
					appId: message.app_id,
					user: message.user,
					botId: isBot ? message.bot_id : undefined,
					text: message.text,
					blocks: message.blocks,
				};
				return msg;
			})
			.filter((msg) => msg !== null);

		return Ok(result);
	}

    async extractInfoFromThreadMessages(
		channelId: string,
		threadTs: string,
	): Promise<Result<UserTagsAssignment, Error>> {
        const botUserId = await this.getBotUserId();
        
		const { messages } = await this.client.conversations.replies({
			channel: channelId,
			ts: threadTs,
			limit: 50,
		});

		// Ensure we have messages

		if (!messages) return Err(new Error("No messages found in thread"));

		const result = messages
			.map((message) => {
				const ts = message.ts; // can update the 1st message with this!
				const isBot = !!message.bot_id;
				if (!message.text) return null;

				// For app mentions, remove the mention prefix
				// For IM messages, keep the full text
				let content = message.text;
				if (!isBot && content.includes(`<@${botUserId}>`)) {
					content = content.replace(`<@${botUserId}> `, "");
				}

				const msg: ThreadMessage = {
					role: isBot ? "assistant" : "user",
					ts: ts,
					isBot: isBot,
					appId: message.app_id,
					user: message.user,
					botId: isBot ? message.bot_id : undefined,
					text: message.text,
					blocks: message.blocks,
				};
				return msg;
			})
			.filter((msg) => msg !== null);

		return Ok(result);
	}

	async postMessage(
		channelIs: string,
		title: string,
		description: string,
		userTagsAssignment: UserTagsAssignment,
		users: User[],
	): Promise<Result<void, Error>> {
		const initialMessage = await this.client.chat.postMessage({
			channel: channelIs,
			// if you ommit thread_ts, the message will be posted in the channel
			text: "message in channel",
			blocks: createSlackMessageBlocks({
				top: {
					left: title,
					right: description,
				},
				mainContent: userTagsAssignment,
				bottomContent:
					"Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
				users: users,
			}),
		});

		if (!initialMessage || !initialMessage.ts)
			return Err(new Error("Failed to post initial message"));

		return Ok(undefined);
	}

}

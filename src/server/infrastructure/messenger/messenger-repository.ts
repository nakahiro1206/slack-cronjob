import { Result, Ok, Err } from "@/lib/result";
import {
	MessengerRepositoryInterface,
} from "@/server/application/interfaces";
import type {
	UserTagsAssignment,
	ThreadMessage,
} from "@/server/domain/entities";
import { WebClient } from "@slack/web-api";
// import type { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import { User } from "@/models/user";
import { createSlackMessageBlocks, extractMainContent, extractTextFromBlocks, extractTopLeftContent } from "@/lib/slack/schema";

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
	): Promise<Result<{
		title: string;
		userTagAssignments: UserTagsAssignment;
		rootMessageTs: string | undefined;
		userQuery: string;
	}, Error>> {
        const botUserId = await this.getBotUserId();
        
		const { messages } = await this.client.conversations.replies({
			channel: channelId,
			ts: threadTs,
			limit: 50,
		});

		// Ensure we have messages

		if (!messages) return Err(new Error("No messages found in thread"));

		const rootMessageTs = messages[0]?.ts;

		const messageBlocksSequence = messages
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

				return message.blocks
			})
			.filter((blocks) => blocks !== null);
		
		const rootMessageBlocks = messageBlocksSequence[0] || [];
		const lastMessageBlocks = messageBlocksSequence[messageBlocksSequence.length - 1] || [];
		const title = extractTopLeftContent(rootMessageBlocks);
		const userTagAssignments = extractMainContent(rootMessageBlocks);
		const userQuery = extractTextFromBlocks(lastMessageBlocks).join("\n");

		return Ok({
			title,
			userTagAssignments,
			rootMessageTs,
			userQuery,
		});
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


	// export const updateMessageInChannel = async (input: {
	// 	channel: string;
	// 	title: string;
	// 	timestamp: string;
	// 	messages: MessageParam[] | undefined;
	// }) => {
	// 	const { channel, title, timestamp, messages } = input;
	// 	const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
	// 	const usersResult = await getUsers();
	// 	const users = usersResult.match(
	// 		(users) => users,
	// 		(error) => {
	// 			console.error("Failed to get users:", error);
	// 			return [];
	// 		},
	// 	);
	// 	const post = async (content: GenerateResponseReturn) => {
	// 		await client.chat.update({
	// 			channel: channel,
	// 			ts: timestamp,
	// 			text: "updated by the bot",
	// 			blocks: createSlackMessageBlocks({
	// 				top: {
	// 					left: title,
	// 					right: `*⏰ Updated at(UTC+9):*\n ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${day}, ${month} ${date}, ${year}`,
	// 				},
	// 				mainContent: content,
	// 				bottomContent:
	// 					"Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
	// 				users: users,
	// 			}),
	// 		});
	// 	};
	// 	if (messages === undefined || messages.length === 0) {
	// 		await post({
	// 			offline: ["updating", "order"],
	// 			online: [],
	// 		});
	// 		return;
	// 	}
	// 	const result = await generateResponse(messages, () => {});
	// 	await post(result);
	// };
}

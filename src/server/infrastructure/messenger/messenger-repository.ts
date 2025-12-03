import { WebClient } from "@slack/web-api";
import { Err, Ok, type Result } from "@/lib/result";
import type { User } from "@/models/user";
import type { MessengerRepositoryInterface } from "@/server/application/interfaces";
import type { UserTagsAssignment } from "@/server/domain/entities";
import {
	createSlackMessageBlocks,
	extractMainContent,
	extractTextFromBlocks,
	extractTopLeftContent,
} from "@/server/infrastructure/messenger/schema";
import { formatUserAssignment } from "../utils";

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
	}

	async extractInfoFromThreadMessages(
		channelId: string,
		threadTs: string,
	): Promise<
		Result<
			{
				title: string;
				userTagAssignments: UserTagsAssignment;
				rootMessageTs: string | undefined;
				userQuery: string;
			},
			Error
		>
	> {
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

				return message.blocks;
			})
			.filter((blocks) => blocks !== null);

		const rootMessageBlocks = messageBlocksSequence[0] || [];
		const lastMessageBlocks =
			messageBlocksSequence[messageBlocksSequence.length - 1] || [];
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
		channelId: string,
		title: string,
		description: string,
		userTagsAssignment: UserTagsAssignment,
		users: User[],
	): Promise<Result<{ messageTs: string }, Error>> {
		const formattedUserAssignments = formatUserAssignment(userTagsAssignment);
		const initialMessage = await this.client.chat.postMessage({
			channel: channelId,
			// if you ommit thread_ts, the message will be posted in the channel
			text: "message in channel",
			blocks: createSlackMessageBlocks({
				top: {
					left: title,
					right: description,
				},
				mainContent: formattedUserAssignments,
				bottomContent:
					"Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
				users: users,
			}),
		});

		if (!initialMessage || !initialMessage.ts)
			return Err(new Error("Failed to post initial message"));

		return Ok({
			messageTs: initialMessage.ts,
		});
	}

	async updateMessage(
		channelId: string,
		title: string,
		description: string,
		timestamp: string,
		userTagsAssignment: UserTagsAssignment,
		users: User[],
	): Promise<Result<void, Error>> {
		const formattedUserAssignments = formatUserAssignment(userTagsAssignment);
		const updatedMessage = await this.client.chat.update({
			channel: channelId,
			ts: timestamp,
			text: "updated by the bot",
			blocks: createSlackMessageBlocks({
				top: {
					left: title,
					right: description,
				},
				mainContent: formattedUserAssignments,
				bottomContent:
					"Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
				users: users,
			}),
		});

		if (!updatedMessage || !updatedMessage.ts)
			return Err(new Error("Failed to update message"));

		return Ok(undefined);
	}
}

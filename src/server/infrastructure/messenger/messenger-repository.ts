import { WebClient } from "@slack/web-api";
import { Err, Ok, type Result } from "@/lib/result";
import type { User } from "@/models/user";
import type { MessengerRepositoryInterface } from "@/server/application/interfaces";
import type { UserTagsAssignment } from "@/server/domain/entities";
import { formatUserAssignment } from "../utils";

export const NewMessengerRepository = (): MessengerRepositoryInterface => {
	return new MessengerRepository();
};

class MessengerRepository implements MessengerRepositoryInterface {
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
		// console.log("Fetched messages in thread:", JSON.stringify(messages, null, 2));
		// throw new Error("Debugging - remove this line");

		if (!messages || messages.length < 2)
			return Err(new Error("Insufficient messages in thread"));

		const rootMessage = messages[0];
		const rootMessageTs = rootMessage.ts;
		const rootMessageBlocks = rootMessage.blocks || [];
		const lastMessage = messages[messages.length - 1];

		let title: string | undefined;
		let mode: "online" | "offline" | undefined;
		const userTagAssignments: UserTagsAssignment = { offline: [], online: [] };
		rootMessageBlocks.forEach((block) => {
			// section with fields
			if (block.type === "section" && block.fields) {
				const firstField = block.fields[0];
				title = firstField.text;
			} else if (
				// @ts-expect-error blocks type issue
				block.type === "header" &&
				block.text?.text
			) {
				const headerText = block.text.text.toLowerCase();
				if (headerText.includes("offline")) {
					mode = "offline";
				} else if (headerText.includes("online")) {
					mode = "online";
				}
			} else if (block.type === "section" && block.text?.text) {
				const regex = /<@U[A-Z0-9]+>/; // include this patter anywhere in the text
				const match = block.text.text.match(regex);
				if (match && mode) {
					const userMention = match[0];
					userTagAssignments[mode].push(userMention);
				}
			}
		});

		// user's message is a plain text message. But need to trim bot id
		const userQuery = lastMessage.text?.replace(`<@${botUserId}>`, "").trim();

		if (userQuery === undefined || userQuery.trim() === "") {
			return Err(new Error("User query is empty"));
		}

		return Ok({
			title: title || "No Title",
			userTagAssignments,
			rootMessageTs,
			userQuery,
		});
	}

	async extractInfoFromMessage(
		channelId: string,
		timestamp: string,
	): Promise<
		Result<
			{
				title: string;
				userTagAssignments: UserTagsAssignment;
			},
			Error
		>
	> {
		const { messages } = await this.client.conversations.history({
			channel: channelId,
			latest: timestamp,
			limit: 1,
			inclusive: true,
		});
		// console.log("Fetched conversation history:", JSON.stringify(messages, null, 2));

		if (!messages || messages.length === 0) {
			return Err(new Error("Message not found"));
		}

		const rootMessage = messages[0];
		const rootMessageBlocks = rootMessage.blocks || [];

		let title: string | undefined;
		let mode: "online" | "offline" | undefined;
		const userTagAssignments: UserTagsAssignment = { offline: [], online: [] };
		rootMessageBlocks.forEach((block) => {
			// section with fields
			if (block.type === "section" && block.fields) {
				const firstField = block.fields[0];
				title = firstField.text;
			} else if (
				// @ts-expect-error blocks type issue
				block.type === "header" &&
				block.text?.text
			) {
				const headerText = block.text.text.toLowerCase();
				if (headerText.includes("offline")) {
					mode = "offline";
				} else if (headerText.includes("online")) {
					mode = "online";
				}
			} else if (block.type === "section" && block.text?.text) {
				const regex = /<@U[A-Z0-9]+>/; // include this pattern anywhere in the text
				const match = block.text.text.match(regex);
				if (match && mode) {
					const userMention = match[0];
					userTagAssignments[mode].push(userMention);
				}
			}
		});

		return Ok({
			title: title || "No Title",
			userTagAssignments,
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
			blocks: [
				// Top header
				{
					type: "section",
					fields: [
						{
							type: "mrkdwn",
							text: title,
						},
						{
							type: "mrkdwn",
							text: description,
						},
					],
				},
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: "You can toggle your progress display",
					},
					accessory: {
						type: "button",
						text: {
							type: "plain_text",
							text: "Finished/Not Yet",
							emoji: true,
						},
						value: "click_me_123",
						action_id: "toggle_1on1_progress",
						style: "primary",
					},
				},
				...(formattedUserAssignments.online.length > 0
					? [
							{
								type: "header",
								text: {
									type: "plain_text",
									text: "🌐Online Orders",
									emoji: true,
								},
							},
						]
					: [null]
				).filter((block) => block !== null),
				...formattedUserAssignments.online.flatMap((userMention) => {
					const userId = userMention.replace("<@", "").replace(">", "");
					const user = users.find((u) => u.userId === userId);
					const huddleUrl = user?.huddleUrl;

					return [
						{
							type: "section",
							text: {
								type: "mrkdwn",
								text: `⬜ ${userMention}`,
							},
							accessory: {
								type: "button",
								text: {
									type: "plain_text",
									text: huddleUrl ? "Join Huddle" : "Not Registered",
									emoji: true,
								},
								value: "click_me_123",
								url: huddleUrl || "https://www.google.com/",
								action_id: "button-action",
							},
						},
						{
							type: "divider",
						},
					];
				}),
				...(formattedUserAssignments.offline.length > 0
					? [
							{
								type: "header",
								text: {
									type: "plain_text",
									text: "🪑Offline Orders",
									emoji: true,
								},
							},
						]
					: []),
				...formattedUserAssignments.offline.flatMap((userMention) => {
					const userId = userMention.replace("<@", "").replace(">", "");
					const user = users.find((u) => u.userId === userId);
					const huddleUrl = user?.huddleUrl;

					return [
						{
							type: "section",
							text: {
								type: "mrkdwn",
								text: `⬜ ${userMention}`,
							},
							accessory: {
								type: "button",
								text: {
									type: "plain_text",
									text: huddleUrl ? "Join Huddle" : "Not Registered",
									emoji: true,
								},
								value: "click_me_123",
								url: huddleUrl || "https://www.google.com/",
								action_id: "button-action",
							},
						},
						{
							type: "divider",
						},
					];
				}),
				// Bottom content
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: "Want to edit the upcoming slot? \n Visit <https://slack-cronjob.vercel.app/>",
					},
				},
			],
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
		completedUserIds: string[],
	): Promise<Result<void, Error>> {
		const formattedUserAssignments = formatUserAssignment(userTagsAssignment);
		const updatedMessage = await this.client.chat.update({
			channel: channelId,
			ts: timestamp,
			text: "updated by the bot",
			blocks: [
				// Top header
				{
					type: "section",
					fields: [
						{
							type: "mrkdwn",
							text: title,
						},
						{
							type: "mrkdwn",
							text: description,
						},
					],
				},
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: "You can toggle your progress display",
					},
					accessory: {
						type: "button",
						text: {
							type: "plain_text",
							text: "Finished/Not Yet",
							emoji: true,
						},
						value: "click_me_123",
						action_id: "toggle_1on1_progress",
						style: "primary",
					},
				},
				...(formattedUserAssignments.online.length > 0
					? [
							{
								type: "header",
								text: {
									type: "plain_text",
									text: "🌐Online Orders",
									emoji: true,
								},
							},
						]
					: [null]
				).filter((block) => block !== null),
				...formattedUserAssignments.online.flatMap((userMention) => {
					const userId = userMention.replace("<@", "").replace(">", "");
					const user = users.find((u) => u.userId === userId);
					const huddleUrl = user?.huddleUrl;
					const isCompleted = completedUserIds.includes(userId);

					return [
						{
							type: "section",
							text: {
								type: "mrkdwn",
								text: `${isCompleted ? "✅ " : "⬜ "}${userMention}`,
							},
							accessory: {
								type: "button",
								text: {
									type: "plain_text",
									text: huddleUrl ? "Join Huddle" : "Not Registered",
									emoji: true,
								},
								value: "click_me_123",
								url: huddleUrl || "https://www.google.com/",
								action_id: "button-action",
							},
						},
						{
							type: "divider",
						},
					];
				}),
				...(formattedUserAssignments.offline.length > 0
					? [
							{
								type: "header",
								text: {
									type: "plain_text",
									text: "🪑Offline Orders",
									emoji: true,
								},
							},
						]
					: []),
				...formattedUserAssignments.offline.flatMap((userMention) => {
					const userId = userMention.replace("<@", "").replace(">", "");
					const user = users.find((u) => u.userId === userId);
					const huddleUrl = user?.huddleUrl;
					const isCompleted = completedUserIds.includes(userId);

					return [
						{
							type: "section",
							text: {
								type: "mrkdwn",
								text: `${isCompleted ? "✅ " : "⬜ "}${userMention}`,
							},
							accessory: {
								type: "button",
								text: {
									type: "plain_text",
									text: huddleUrl ? "Join Huddle" : "Not Registered",
									emoji: true,
								},
								value: "click_me_123",
								url: huddleUrl || "https://www.google.com/",
								action_id: "button-action",
							},
						},
						{
							type: "divider",
						},
					];
				}),
				// Bottom content
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: "Want to edit the upcoming slot? \n Visit <https://slack-cronjob.vercel.app/>",
					},
				},
			],
		});

		if (!updatedMessage || !updatedMessage.ts)
			return Err(new Error("Failed to update message"));

		return Ok(undefined);
	}
}

import { User } from "@/models/user";
import type { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import { z } from "zod";
// To scan the message content effectively,
// slack bot should obey the folling message structure
// export const SlackNotificationSchema = z.tuple([
// 	z.object({
// 		type: z.literal("section"),
// 		fields: z.tuple([
// 			// date block
// 			z.object({
// 				type: z.literal("mrkdwn"),
// 				text: z.string(),
// 			}),
// 			// time block
// 			z.object({
// 				type: z.literal("mrkdwn"),
// 				text: z.string(),
// 			}),
// 		]),
// 	}),
// 	// main content block
// 	z.object({
// 		type: z.literal("section"),
// 		text: z.object({
// 			type: z.literal("mrkdwn"),
// 			text: z.string(),
// 		}),
// 	}),
// 	// help block
// 	z.object({
// 		type: z.literal("section"),
// 		text: z.object({
// 			type: z.literal("mrkdwn"),
// 			text: z.string(),
// 		}),
// 	}),
// ]);

// export type SlackNotification = z.infer<typeof SlackNotificationSchema>;

const linkButtonSchema = z.object({
			"type": z.literal("section"),
			"text": z.object({
				"type": z.literal("mrkdwn"),
				"text": z.string(),
			}),
			// "accessory": z.object({
			// 	"type": z.literal("button"),
				// "text": {
				// 	"type": "plain_text",
				// 	"text": "Click Me",
				// 	"emoji": true
				// },
				// "value": "click_me_123",
			// 	"url": z.string().url(),
			// 	"action_id": z.literal("button-action"),
			// }),
		});

// get user ids
export const extractMainContent = (blocks: PurpleBlock[]): string[] => {
	if (blocks.length <= 2) {
		return [];
	}
	const mainContentBlock = blocks.slice(1, -1); // remove first and last block
	const result = linkButtonSchema.array().safeParse(mainContentBlock);
	if (!result.success) {
		return [];
	}
	return result.data
		.map((block => block.text.text))
		.filter((text): text is string => text !== undefined);
};

export const headerSchema = z.object({
			type: z.literal("section"),
			fields: z.tuple([
				z.object({
					type: z.literal("mrkdwn"),
					text: z.string(),
				}),
				z.object({
					type: z.literal("mrkdwn"), 
					text: z.string(),
				})
			]),
		});

export const extractTopLeftContent = (blocks: PurpleBlock[]): string => {
	if (blocks.length === 0) {
		return "";
	}
	const firstBlock = blocks[0];
	const result = headerSchema.safeParse(firstBlock);
	if (!result.success) {
		return "";
	}
	return result.data.fields[0].text;
};

export const extractTextFromBlocks = (blocks: PurpleBlock[]): string[] => {
	return blocks
		.map((block) => {
			return block.text?.text;
		})
		.filter((text): text is string => text !== undefined);
};

export const createSlackMessageBlocks = (props: {
	mainContent: {
		offline: string[];
		online: string[];
	}
	top: {
		left: string;
		right: string;
	};
	bottomContent: string;
	users: User[];
}) => {
	const header = [{
			type: "section",
			fields: [
				{
					type: "mrkdwn",
					text: props.top.left,
				},
				{
					type: "mrkdwn",
					text: props.top.right,
				},
			],
		}]
	const onlineSectionHeader = props.mainContent.online.length > 0 ? [{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "🌐Online Orders",
				"emoji": true
			}
		}] : [];
	const onlineSection = props.mainContent.online.map((userId) => {
		const userMention = `<@${userId}>`;
		const user = props.users.find((u) => u.userId === userId);
		const huddleUrl = user?.huddleUrl
		return {
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": userMention,
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Join Huddle",
					"emoji": true
				},
				"value": "click_me_123",
				"url": huddleUrl || "", 
				"action_id": "button-action"
			}
		}
	});
	const offlineSectionHeader = props.mainContent.offline.length > 0 ? [{
		"type": "header",
		"text": {
			"type": "plain_text",
			"text": "🪑Offline Orders",
			"emoji": true
		}
	}] : [];
	const offlineSection = props.mainContent.offline.map((userId) => {
		const userMention = `<@${userId}>`;
		const user = props.users.find((u) => u.userId === userId);
		const huddleUrl = user?.huddleUrl
		return {
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": userMention,
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Click Me",
					"emoji": true
				},
				"value": "click_me_123",
				"url": huddleUrl || undefined,
				"action_id": "button-action"
			}
		}
	})
	const footer = [{
			type: "section",
			text: {
				type: "mrkdwn",
				text: props.bottomContent,
			},
		}]
	return [...header, ...onlineSectionHeader, ...onlineSection, ...offlineSectionHeader, ...offlineSection, ...footer];
};

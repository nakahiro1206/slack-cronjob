import { User } from "@/models/user";
import { UserTagsAssignment } from "@/server/domain/entities";
import type { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import { z } from "zod";

const linkButtonSchema = z.object({
	type: z.literal("section"),
	text: z.object({
		type: z.literal("mrkdwn"),
		text: z.string(),
	}),
	accessory: z.object({
		type: z.literal("button"),
		text: z.object({
			type: z.literal("plain_text"),
			text: z.string(),
			emoji: z.literal(true),
		}),
		value: z.string(),
		url: z.string().url(),
		action_id: z.literal("button-action"),
	}),
});

export type LinkButtonBlock = z.infer<typeof linkButtonSchema>;

export const dividerBlock = z.object({
	type: z.literal("divider"),
});

export type DividerBlock = z.infer<typeof dividerBlock>;

const HeaderBlockSchema = z.object({
	type: z.literal("header"),
	text: z.object({
		type: z.literal("plain_text"),
		text: z.string(),
		emoji: z.boolean(),
	}),
});

export type HeaderBlock = z.infer<typeof HeaderBlockSchema>;

// get user ids
export const extractMainContent = (
	blocks: PurpleBlock[],
): UserTagsAssignment => {
	if (blocks.length <= 2) {
		return {
			offline: [],
			online: [],
		};
	}
	const mainContentBlock = blocks.slice(1, -1); // remove first and last block corresponding to header and footer
	const result = linkButtonSchema
		.or(dividerBlock)
		.or(HeaderBlockSchema)
		.array()
		.safeParse(mainContentBlock);
	if (!result.success) {
		return {
			offline: [],
			online: [],
		};
	}
	const res: UserTagsAssignment = {
		offline: [],
		online: [],
	};
	let currentSection: "offline" | "online" = "online"; // always start with online section
	result.data.forEach((block) => {
		if (block.type === "header") {
			const header = block.text.text.toLowerCase();
			if (header.includes("offline")) {
				currentSection = "offline";
			} else if (header.includes("online")) {
				currentSection = "online";
			}
		} else if (block.type === "section") {
			const userMention = block.text.text;
			res[currentSection].push(userMention);
		}
	});
	return res;
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
		}),
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
	};
	top: {
		left: string;
		right: string;
	};
	bottomContent: string;
	users: User[];
}) => {
	const header = [
		{
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
		},
	];
	const onlineSectionHeader =
		props.mainContent.online.length > 0
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
			: [];

	const appendBlock = (
		prev: Array<LinkButtonBlock | DividerBlock>,
		userMention: string,
	) => {
		const userId = userMention.replace("<@", "").replace(">", "");
		const user = props.users.find((u) => u.userId === userId);
		const huddleUrl = user?.huddleUrl;
		prev.push({
			type: "section",
			text: {
				type: "mrkdwn",
				text: userMention,
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
		});
		prev.push({
			type: "divider",
		});
		return prev;
	};
	const onlineSection = props.mainContent.online.reduce<
		Array<LinkButtonBlock | DividerBlock>
	>(appendBlock, []);
	const offlineSectionHeader =
		props.mainContent.offline.length > 0
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
			: [];
	const offlineSection = props.mainContent.offline.reduce<
		Array<LinkButtonBlock | DividerBlock>
	>(appendBlock, []);
	const footer = [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: props.bottomContent,
			},
		},
	];
	return [
		...header,
		...onlineSectionHeader,
		...onlineSection,
		...offlineSectionHeader,
		...offlineSection,
		...footer,
	];
};

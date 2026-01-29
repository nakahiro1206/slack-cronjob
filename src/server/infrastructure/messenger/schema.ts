import type { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import { z } from "zod";
import type { User } from "@/models/user";
import type { UserTagsAssignment } from "@/server/domain/entities";

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

type LinkButtonBlock = z.infer<typeof linkButtonSchema>;

export const dividerBlock = z.object({
	type: z.literal("divider"),
});

type DividerBlock = z.infer<typeof dividerBlock>;

const HeaderBlockSchema = z.object({
	type: z.literal("header"),
	text: z.object({
		type: z.literal("plain_text"),
		text: z.string(),
		emoji: z.boolean(),
	}),
});

// get user ids
export const extractMainContent = (
	blocks: PurpleBlock[],
): UserTagsAssignment => {
	if (blocks.length <= 3) {
		return {
			offline: [],
			online: [],
		};
	}
	const mainContentBlock = blocks.slice(2, -1); // remove first 2 and last block corresponding to header and footer
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
			const regex = /^<@U[A-Z0-9]+>$/;
			const match = block.text.text.match(regex); // search for user mention
			if (!match) {
				return; // skip if no match
			}
			const userMention = match[0]; // should be like <@U12345678>
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
	//   '{"type":"rich_text","block_id":"FUh5J","elements":[{"type":"rich_text_section","elements":[{"type":"user","user_id":"U0927N91N0K"},{"type":"text","text":" test2"}]}]}'
	return blocks
		.map((block) => {
			// return block.text?.text;
			// '{
			//    "type":"rich_text","block_id":"55A5N",
			//    "elements":[
			//      {"type":"rich_text_section","elements":[
			//        {"type":"user","user_id":"U0927N91N0K"},{"type":"text","text":" test4"}
			//      ]}
			//   ]}'
			const elements = block.elements;
			const internalElements = elements?.flatMap((el) => el.elements)
			if (!internalElements) return ""
			return internalElements.map((ie) => {
				if (ie?.elements === undefined) {return "";}
				return ie?.elements?.map((textEl) => textEl.text).join("");
			}).join("");
		})
		// .filter((text): text is string => text !== undefined);
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
	completedUserIds: string[];
}) => {
	const validateMainContent = () => {
		const regex = /^<@U[A-Z0-9]+>$/;
		props.mainContent.offline.forEach((mention) => {
			if (!regex.test(mention)) {
				console.error(`Invalid user mention format: ${mention}`);
				throw new Error(`Invalid user mention format: ${mention}`);
			}
		});
		props.mainContent.online.forEach((mention) => {
			if (!regex.test(mention)) {
				console.error(`Invalid user mention format: ${mention}`);
				throw new Error(`Invalid user mention format: ${mention}`);
			}
		});
	};
	validateMainContent();

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
		{// ⬜✅
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "You can toggle your progress display"
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Finished/Not Yet",
					"emoji": true
				},
				"value": "click_me_123",
				"action_id": "toggle_1on1_progress",
				"style": "primary"
			}
		}
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
		const isCompleted = props.completedUserIds.includes(userId);
		prev.push({
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

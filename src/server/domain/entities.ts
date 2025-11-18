import { z } from "zod";
// TODO: remove purpleblock import
import type { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse";

export const UserTagsAssignmentSchema = z.object({
	offline: z.array(z.string()), // Array of User Mention
	online: z.array(z.string()), // Array of User Mention
});

export type UserTagsAssignment = z.infer<typeof UserTagsAssignmentSchema>;

export type MessageParam = {
	role: "system" | "user" | "assistant";
	content: string;
};

export type ThreadMessage = {
	role: "assistant" | "user";
	ts: string | undefined;
	isBot: boolean;
	botId: string | undefined;
	appId: string | undefined;
	user: string | undefined;
	text: string;
	blocks: PurpleBlock[] | undefined;
};

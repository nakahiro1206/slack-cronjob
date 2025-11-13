import { z } from "zod";
import { Result } from "@/lib/result";
import type { User } from "@/models/user";
// TODO: remove purpleblock import
import type { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse";

export const GenerateResponseReturnSchema = z.object({
	offline: z.array(z.string()), // Array of User ID
	online: z.array(z.string()), // Array of User ID
});

export type GenerateResponseReturn = z.infer<
	typeof GenerateResponseReturnSchema
>;

export type MessageParam = {
	role: "system" | "user" | "assistant";
	content: string;
};

export interface UserRepositoryInterface {
	getUsers(): Promise<string[]>;
}

export interface LLMRepositoryInterface {
	generateResponse(
		messages: MessageParam[],
		updateStatus?: (status: string) => void,
	): Promise<Result<GenerateResponseReturn, Error>>;
}

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

export type UserTagsAssignment = {
	offline: string[];
	online: string[];
};

export interface MessengerRepositoryInterface {
    getBotUserId(): Promise<string>;
	getThreadMessages(
		channelId: string,
		threadTs: string,
	): Promise<Result<ThreadMessage[], Error>>;
    extractInfoFromThreadMessages(
		channelId: string,
		threadTs: string,
	): Promise<Result<UserTagsAssignment, Error>>;
	postMessage(
		channelIs: string,
		title: string,
		description: string,
		userTagsAssignment: UserTagsAssignment,
		users: User[],
	): Promise<Result<void, Error>>;
}

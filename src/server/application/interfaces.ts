import { Result } from "@/lib/result";
import type { User } from "@/models/user";
import type {
	UserTagsAssignment,
	MessageParam,
	ThreadMessage,
} from "../domain/entities";

export interface UserRepositoryInterface {
	getUsers(): Promise<string[]>;
}

export interface LLMRepositoryInterface {
	generateResponse(
		messages: MessageParam[],
		updateStatus?: (status: string) => void,
	): Promise<Result<UserTagsAssignment, Error>>;
}

export interface MessengerRepositoryInterface {
	getBotUserId(): Promise<string>;
	getThreadMessages(
		channelId: string,
		threadTs: string,
	): Promise<Result<ThreadMessage[], Error>>;
	extractInfoFromThreadMessages(
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
	>;
	postMessage(
		channelIs: string,
		title: string,
		description: string,
		userTagsAssignment: UserTagsAssignment,
		users: User[],
	): Promise<Result<{ messageTs: string }, Error>>;
	updateMessage(
		channelId: string,
		title: string,
		description: string,
		timestamp: string,
		userTagsAssignment: UserTagsAssignment,
		users: User[],
	): Promise<Result<void, Error>>;
}

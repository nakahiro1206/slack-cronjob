import { Result } from "@/lib/result";
import type {
	UserTagsAssignment,
	MessageParam,
	ThreadMessage,
	User,
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

export interface UserDatabaseRepositoryInterface {
	getUsers(): Promise<Result<User[], Error>>;
	getUserById(userId: string): Promise<Result<User, Error>>;
	addUser(user: User): Promise<Result<void, Error>>;
	updateUser(user: User): Promise<Result<void, Error>>;
	deleteUser(userId: string): Promise<Result<void, Error>>;
}

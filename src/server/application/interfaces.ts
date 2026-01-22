import type { Result } from "@/lib/result";
import type {
	Channel,
	MessageParam,
	UpcomingSlot,
	User,
	UserTagsAssignment,
} from "../domain/entities";

export interface LLMRepositoryInterface {
	generateResponse(
		messages: MessageParam[],
		updateStatus?: (status: string) => void,
	): Promise<Result<UserTagsAssignment, Error>>;
}

export interface MessengerRepositoryInterface {
	getBotUserId(): Promise<string>;
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

export interface UpcomingSlotDatabaseRepositoryInterface {
	getUpcomingSlots(): Promise<Result<UpcomingSlot[], Error>>;
	initializeSlotsWithUpcomingDate(
		channels: Channel[],
	): Promise<Result<void, Error>>;
	deleteUpcomingSlot(channelId: string): Promise<Result<void, Error>>;
	registerUsers(
		channelId: string,
		userIds: string[],
	): Promise<Result<void, Error>>;
	removeUsers(
		channelId: string,
		userIds: string[],
	): Promise<Result<void, Error>>;
	changeDate(
		channelId: string,
		isoString: string,
	): Promise<Result<void, Error>>;
}

export interface ChannelDatabaseRepositoryInterface {
	getChannels(): Promise<Result<Channel[], Error>>;
	getChannelById(channelId: string): Promise<Result<Channel, Error>>;
	getChannelByUserId(userId: string): Promise<Result<Channel, Error>>;
	addChannel(channel: Channel): Promise<Result<void, Error>>;
	updateChannel(
		channelId: string,
		fields: Pick<Channel, "channelName" | "day">,
	): Promise<Result<void, Error>>;
	deleteChannel(channelId: string): Promise<Result<void, Error>>;
	registerUsers(
		channelId: string,
		userIds: string[],
	): Promise<Result<void, Error>>;
	removeUsers(
		channelId: string,
		userIds: string[],
	): Promise<Result<void, Error>>;
}

import {
	LLMRepositoryInterface,
	MessengerRepositoryInterface,
	UserDatabaseRepositoryInterface,
	UpcomingSlotDatabaseRepositoryInterface,
	ChannelDatabaseRepositoryInterface,
} from "./interfaces";
import { LlmRepository } from "../infrastructure/llm/llm-repository";
import { MessengerRepository } from "../infrastructure/messenger/messenger-repository";
import { UserDatabaseRepository } from "../infrastructure/database/user-database-repository";
import { UpcomingSlotDatabaseRepository } from "../infrastructure/database/upcoming-slot-database-repository";
import { ChannelDatabaseRepository } from "../infrastructure/database/channel-database-repository";

export const NewMessengerRepository = (): MessengerRepositoryInterface => {
	return new MessengerRepository();
};

export const NewLlmRepository = (): LLMRepositoryInterface => {
	return new LlmRepository();
};

export const NewUpcomingSlotsDatabaseRepository =
	(): UpcomingSlotDatabaseRepositoryInterface => {
		return new UpcomingSlotDatabaseRepository();
	};

export const NewUserDatabaseRepository =
	(): UserDatabaseRepositoryInterface => {
		return new UserDatabaseRepository();
	};

export const NewChannelDatabaseRepository =
	(): ChannelDatabaseRepositoryInterface => {
		return new ChannelDatabaseRepository();
	};

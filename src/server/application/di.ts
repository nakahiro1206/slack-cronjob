import {
	LLMRepositoryInterface,
	MessengerRepositoryInterface,
	UserDatabaseRepositoryInterface,
} from "./interfaces";
import { LlmRepository } from "../infrastructure/llm/llm-repository";
import { MessengerRepository } from "../infrastructure/messenger/messenger-repository";
import { UserDatabaseRepository } from "../infrastructure/database/user-database-repository";

export const NewMessengerRepository = (): MessengerRepositoryInterface => {
	return new MessengerRepository();
};

export const NewLlmRepository = (): LLMRepositoryInterface => {
	return new LlmRepository();
};

export const NewUserDatabaseRepository =
	(): UserDatabaseRepositoryInterface => {
		return new UserDatabaseRepository();
	};

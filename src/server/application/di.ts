import {
	LLMRepositoryInterface,
	MessengerRepositoryInterface,
} from "./interfaces";
import { LlmRepository } from "../infrastructure/llm/llm-repository";
import { MessengerRepository } from "../infrastructure/messenger/messenger-repository";

export const NewMessengerRepository = (): MessengerRepositoryInterface => {
	return new MessengerRepository();
};

export const NewLlmRepository = (): LLMRepositoryInterface => {
	return new LlmRepository();
};

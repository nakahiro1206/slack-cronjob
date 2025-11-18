import { notify } from "@/lib/slack/notify";
import { removeBotUserIdTag } from "@/lib/slack/utils";
import {
	LLMRepositoryInterface,
	MessengerRepositoryInterface,
} from "./interfaces";
import { getJapanTimeAsObject } from "@/lib/date";
import { getUsers } from "@/lib/firebase/user";
import { NewLlmRepository, NewMessengerRepository } from "./di";

export type MessageParam = {
	role: "user" | "assistant";
	content: string;
};

class NotificationService {
	constructor(
		private llmRepository: LLMRepositoryInterface,
		private messengerRepository: MessengerRepositoryInterface,
	) {}

	async notifyByCronjob() {
		// TODO: decouple the complicated inside implementation of this function
		const notifyResult = await notify({
			mode: "sameDayOnly",
			updateSlot: true,
		});
		return notifyResult;
	}

	// async notifyBySpecifiedChannels(channelIds: string[]) {
	//     const notifyResult = await notify({ mode: "specifiedChannels", channelIds, updateSlot: true });
	//     return notifyResult;
	// }

	async notifyNewMessageToChannel(
		channel: string,
		text: string,
		botUserId: string,
	) {
		const queries: MessageParam[] = [
			{
				role: "user",
				content: removeBotUserIdTag(text, botUserId),
			},
		];
		const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
		const title = `*📣 1on1 order* \n This order is for the meeting on ${day}, ${month} ${date}, ${year}.`;
		const description = `*⏰ Created at(UTC+9):*\n ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${day}, ${month} ${date}, ${year}`;

		const initMessageRes = await this.messengerRepository.postMessage(
			channel,
			title,
			`${description}\n*🔄 Status:* initializing...`,
			{ offline: [], online: [] },
			[],
		);
		const messageTs = initMessageRes.match(
			({ messageTs }) => messageTs,
			(error) => {
				throw error;
			},
		);

		const usersResult = await getUsers();
		const users = usersResult.match(
			(users) => users,
			(error) => {
				console.error("Failed to get users:", error);
				return [];
			},
		);

		const objectResult = await this.llmRepository.generateResponse(
			queries,
			() => {},
		);
		const obj = objectResult.match(
			(res) => res,
			(error) => {
				console.error("Failed to generate response:", error);
				return null;
			},
		);
		if (!obj) {
			throw new Error("Failed to generate response");
		}

		const result = await this.messengerRepository.updateMessage(
			channel,
			title,
			description,
			messageTs,
			obj,
			users,
		);
		result.match(
			() => {},
			(error) => {
				throw error;
			},
		);
	}

	async updateRootMessageOfThread(
		channelId: string,
		threadTs: string,
		text: string,
		botUserId: string,
	) {
		const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
		const title = `*📣 1on1 order* \n This order is for the meeting on ${day}, ${month} ${date}, ${year}.`;
		const description = `*⏰ Updated at(UTC+9):*\n ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${day}, ${month} ${date}, ${year}`;

		const infoResult =
			await this.messengerRepository.extractInfoFromThreadMessages(
				channelId,
				threadTs,
			);
		const info = infoResult.match(
			(res) => {
				console.log("info", res);
				return res;
			},
			(error) => {
				console.error("Failed to extract info from thread messages:", error);
				throw error;
			},
		);

		const updateToPendingRes = await this.messengerRepository.updateMessage(
			channelId,
			title,
			`${description}\n*🔄 Status:* updating...`,
			info.rootMessageTs!,
			{ offline: [], online: [] },
			[],
		);

		const usersResult = await getUsers();
		const users = usersResult.match(
			(users) => users,
			(error) => {
				console.error("Failed to get users:", error);
				return [];
			},
		);

		updateToPendingRes.match(
			() => {},
			(error) => {
				console.error("Failed to update message:", error);
				throw error;
			},
		);

		const objectResult = await this.llmRepository.generateResponse(
			[
				{
					role: "user",
					content: `${JSON.stringify(info.userTagAssignments)} Above is the corrent user IDs and assignments for online/offline meeting. Please apply the following update request.`,
				},
				{
					role: "user",
					content: removeBotUserIdTag(text, botUserId),
				},
			],
			() => {},
		);

		const obj = objectResult.match(
			(res) => res,
			(error) => {
				console.error("Failed to generate response:", error);
				throw error;
			},
		);

		const updateToNewContentRes = await this.messengerRepository.updateMessage(
			channelId,
			title,
			`${description}`,
			info.rootMessageTs!,
			obj,
			users,
		);

		updateToNewContentRes.match(
			() => {},
			(error) => {
				console.error("Failed to update message:", error);
				throw error;
			},
		);
	}
}

/** Dependency Injection */
export const notificationService = new NotificationService(
	NewLlmRepository(),
	NewMessengerRepository(),
);

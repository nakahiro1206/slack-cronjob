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

		const title = `*📣 1on1 order* \n This order is for the meeting on ${day}, ${month} ${date}, ${year}.`;
		const description = `*⏰ Created at(UTC+9):*\n ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${day}, ${month} ${date}, ${year}`;
		const result = await this.messengerRepository.postMessage(
			channel,
			title,
			description,
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
        status: string,
    ) {
        const threadMessagesResult = await this.messengerRepository.getThreadMessages(
            channelId, threadTs
        )
        const threadMessages = threadMessagesResult.match(
            (res) => {
                console.log("threadMessages", res);
                return res
            },
            (error) => {
                console.error("Failed to get thread messages:", error);
                throw error;
            },
        );
        if (threadMessages.length === 0) {
            throw new Error("No messages in thread");
        }
        const rootMessage = threadMessages[0];
        const lastMessage = threadMessages[threadMessages.length - 1];
        console.log("rootMessage", rootMessage);
        console.log("lastMessage", lastMessage);
        // if the root message is from bot, and last message is not from bot, update the root message
        // try {
			//         // Get the full thread context
			//         const messages = await getThread(channel, thread_ts, botUserId);
			//         // console.log("messages", messages);
			//         console.log("bot user id", botUserId);
			//         if (messages.length > 1) {
			//             const firstMessage = messages[0];
			//             const firstMessageTopLeftContent = extractTopLeftContent(
			//                 firstMessage.blocks || [],
			//             );
			//             const firstMessageMainContent = extractMainContent(
			//                 firstMessage.blocks || [],
			//             );
			//             const lastMessage = messages[messages.length - 1];
			//             console.log("The first message is from the bot. updating it");
			//             // update the first message
			//             await updateMessageInChannel({
			//                 channel,
			//                 title: firstMessageTopLeftContent,
			//                 timestamp: firstMessage.ts as string,
			//                 messages: undefined, // show loading state
			//             });

			//             console.log("lastMessage", lastMessage);

			//             const queries: MessageParam[] = [
			//                 {
			//                     role: "assistant",
			//                     content: "User IDs: "+ JSON.stringify(firstMessageMainContent),
			//                 },
			//                 {
			//                     role: "user",
			//                     content: removeBotUserIdTag(lastMessage.text, botUserId),
			//                 },
			//             ];

			//             console.log("queries", queries);
			//             // update the message with the LLM's response
			//             await updateMessageInChannel({
			//                 channel,
			//                 title: firstMessageTopLeftContent,
			//                 timestamp: firstMessage.ts as string,
			//                 messages: queries,
			//             });
			//             return;
			//         }

			//         console.log("Successfully handled app mention in thread");
			//     } catch (error) {
			//         console.error("Error handling app mention in thread:", error);
			//     }
    }
}

/** Dependency Injection */
export const notificationService = new NotificationService(
	NewLlmRepository(),
	NewMessengerRepository(),
);

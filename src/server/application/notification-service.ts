import { Random } from "random";
import {
	getJapanTimeAsObject,
	isSameDateWithTodayJapanTime,
	isFutureDateJapanTime,
} from "@/lib/date";
import { removeBotUserIdTag } from "@/server/infrastructure/utils";
import type { MessageParam } from "../domain/entities";
import type {
	ChannelDatabaseRepositoryInterface,
	LLMRepositoryInterface,
	MessengerRepositoryInterface,
	UpcomingSlotDatabaseRepositoryInterface,
	UserDatabaseRepositoryInterface,
} from "./interfaces";

export class NotificationService {
	constructor(
		private llmRepository: LLMRepositoryInterface,
		private messengerRepository: MessengerRepositoryInterface,
		private userDatabaseRepository: UserDatabaseRepositoryInterface,
		private upcomingSlotDatabaseRepository: UpcomingSlotDatabaseRepositoryInterface,
		private channelDatabaseRepository: ChannelDatabaseRepositoryInterface,
	) {}

	async notifyByCronjob(
		updateSlots: boolean = true,
	): Promise<{ success: boolean; message?: string }> {
		const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
		const description = `*⏰ Created at (UTC+9):*\n ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${day}, ${month} ${date}, ${year}`;

		const rng = new Random(`${new Date().toISOString()}`);

		const usersResult = await this.userDatabaseRepository.getUsers();
		const users = usersResult.match(
			(users) => users,
			(error) => {
				console.error("Failed to get users:", error);
				return [];
			},
		);

		const channelsResutl = await this.channelDatabaseRepository.getChannels();
		const channels = channelsResutl.match(
			(channels) => channels,
			(error) => {
				console.error("Failed to get channels:", error);
				return [];
			},
		);

		const upcomingSlotsResult =
			await this.upcomingSlotDatabaseRepository.getUpcomingSlots();
		const upcomingSlots = upcomingSlotsResult.match(
			(slots) => slots,
			(error) => {
				console.error("Failed to get upcoming slots:", error);
				return [];
			},
		);

		const targetSlots = upcomingSlots.filter((slot) => {
			return isSameDateWithTodayJapanTime(slot.date);
		});

		try {
			await Promise.all(
				targetSlots.map(async (slot) => {
					const title = `*📣 1on1 order for ${slot.channelName}* \n This order is for the meeting on ${day}, ${month} ${date}, ${year}.`;
					const shuffledOfflineUserIds = [...slot.offlineUserIds].sort(
						() => rng.float(0, 1) - 0.5,
					);
					const shuffledOnlineUserIds = [...slot.onlineUserIds].sort(
						() => rng.float(0, 1) - 0.5,
					);
					const offlineMentions = shuffledOfflineUserIds.map(
						(userId) => `<@${userId}>`,
					);
					const onlineMentions = shuffledOnlineUserIds.map(
						(userId) => `<@${userId}>`,
					);
					await this.messengerRepository.postMessage(
						slot.channelId,
						title,
						description,
						{ offline: offlineMentions, online: onlineMentions },
						users,
					);
				}),
			);
		} catch (error) {
			console.error("Failed to notify channels:", error);
			return {
				success: false,
				message: "Failed to notify channels",
			};
		}

		// Update slots for next week if needed
		if (updateSlots === false) {
			return {
				success: true,
				message: "Notifications sent successfully. Skipped slot update.",
			};
		}

		const futureUpcomingSlots = upcomingSlots.filter((slot) =>
			isFutureDateJapanTime(slot.date),
		);
		const channelsToReinitialize = channels.filter(
			(channel) =>
				// not in futureUpcomingSlots
				!futureUpcomingSlots.some(
					(slot) => slot.channelId === channel.channelId,
				),
		);

		// Re-initialize outdated slots
		const reinitializeResult =
			await this.upcomingSlotDatabaseRepository.initializeSlotsWithUpcomingDate(
				channelsToReinitialize,
			);
		reinitializeResult.match(
			() => {},
			(error) => {
				console.error("Failed to re-initialize slots:", error);
			},
		);

		return {
			success: true,
			message: "Notifications sent successfully",
		};
	}

	async notifyToSpecifiedChannels(
		channelIds: string[],
		updateSlots: boolean = false,
	): Promise<{ success: boolean; message?: string }> {
		const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
		const description = `*⏰ Created at (UTC+9):*\n ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${day}, ${month} ${date}, ${year}`;

		const rng = new Random(`${new Date().toISOString()}`);

		const usersResult = await this.userDatabaseRepository.getUsers();
		const users = usersResult.match(
			(users) => users,
			(error) => {
				console.error("Failed to get users:", error);
				return [];
			},
		);

		const channelsResutl = await this.channelDatabaseRepository.getChannels();
		const channels = channelsResutl.match(
			(channels) => channels,
			(error) => {
				console.error("Failed to get channels:", error);
				return [];
			},
		);

		const targetChannels = channels.filter((channel) => {
			return channelIds.includes(channel.channelId);
		});

		try {
			await Promise.all(
				targetChannels.map(async (channel) => {
					const title = `*📣 1on1 order for ${channel.channelName}* \n This order is for the meeting on ${day}, ${month} ${date}, ${year}.`;
					const shuffledUserIds = channel.userIds.sort(
						() => rng.float(0, 1) - 0.5,
					);
					await this.messengerRepository.postMessage(
						channel.channelId,
						title,
						description,
						{ offline: shuffledUserIds, online: [] },
						users,
					);
				}),
			);
		} catch (error) {
			console.error("Failed to notify channels:", error);
			return {
				success: false,
				message: "Failed to notify channels",
			};
		}

		// Update slots for next week if needed
		if (updateSlots === false) {
			return {
				success: true,
				message: "Notifications sent successfully. Skipped slot update.",
			};
		}

		const upcomingSlotsResult =
			await this.upcomingSlotDatabaseRepository.getUpcomingSlots();
		const upcomingSlots = upcomingSlotsResult.match(
			(slots) => slots,
			(error) => {
				console.error("Failed to get upcoming slots:", error);
				return [];
			},
		);
		const futureUpcomingSlots = upcomingSlots.filter((slot) =>
			isFutureDateJapanTime(slot.date),
		);
		const channelsToReinitialize = channels.filter(
			(channel) =>
				// not in futureUpcomingSlots
				!futureUpcomingSlots.some(
					(slot) => slot.channelId === channel.channelId,
				),
		);

		// Re-initialize outdated slots
		const reinitializeResult =
			await this.upcomingSlotDatabaseRepository.initializeSlotsWithUpcomingDate(
				channelsToReinitialize,
			);
		reinitializeResult.match(
			() => {},
			(error) => {
				console.error("Failed to re-initialize slots:", error);
			},
		);

		return {
			success: true,
			message: "Notifications sent successfully",
		};
	}

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

		const usersResult = await this.userDatabaseRepository.getUsers();
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

		const usersResult = await this.userDatabaseRepository.getUsers();
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

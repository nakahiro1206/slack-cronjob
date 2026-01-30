import type {
	MessengerRepositoryInterface,
	UpcomingSlotDatabaseRepositoryInterface,
	UserDatabaseRepositoryInterface,
} from "./interfaces";
import { Ok, Err } from "@/lib/result";
import { getJapanTimeAsObject } from "@/lib/date";
export class WorkspaceService {
	constructor(
		private messengerRepository: MessengerRepositoryInterface,
		private upcomingSlotDatabaseRepository: UpcomingSlotDatabaseRepositoryInterface,
		private userDatabaseRepository: UserDatabaseRepositoryInterface,
	) {}

	async toggleProgress(userId: string, channelId: string, messageTs: string) {
		// find message info
		const infoResult = await this.messengerRepository.extractInfoFromMessage(
			channelId,
			messageTs,
		);
		if (infoResult.isErr()) {
			return Err(infoResult.error);
		}
		const { title, userTagAssignments } = infoResult.unwrap();
		console.log("Message info extracted:", { title, userTagAssignments });

		const res = await this.upcomingSlotDatabaseRepository.getUpcomingSlots();
		console.log("Upcoming slots fetched:", res);
		if (res.isErr()) {
			return Err(res.error);
		}
		const upcomingSlots = res.unwrap();
		console.log("Upcoming slots:", upcomingSlots);
		const slot = upcomingSlots.find(
			(slot) => slot.channelId === channelId, // should compare by the message timestamp.
		);
		if (!slot) {
			return Err(new Error("No matching upcoming slot found"));
		}
		console.log("Found slot:", slot);
		const completedUserIds = slot.completedUserIds || [];
		let updatedCompletedUserIds: string[];
		if (completedUserIds.includes(userId)) {
			// remove userId
			updatedCompletedUserIds = completedUserIds.filter((id) => id !== userId);
			const removalResult =
				await this.upcomingSlotDatabaseRepository.removeCompletedUser(
					channelId,
					userId,
				);
			if (removalResult.isErr()) {
				return Err(removalResult.error);
			}
		} else {
			// add userId
			updatedCompletedUserIds = [...completedUserIds, userId];
			const additionResult =
				await this.upcomingSlotDatabaseRepository.addCompletedUser(
					channelId,
					userId,
				);
			if (additionResult.isErr()) {
				return Err(additionResult.error);
			}
		}
		const usersResult = await this.userDatabaseRepository.getUsers();
		if (usersResult.isErr()) {
			return Err(usersResult.error);
		}
		const users = usersResult.unwrap();
		const { hour, minute, date, day, month, year } = getJapanTimeAsObject();
		const description = `*⏰ Updated at(UTC+9):*\n ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${day}, ${month} ${date}, ${year}`;

		const updateMessageResult = await this.messengerRepository.updateMessage(
			channelId,
			title,
			description,
			messageTs,
			userTagAssignments,
			users,
			updatedCompletedUserIds,
		);
		if (updateMessageResult.isErr()) {
			return Err(updateMessageResult.error);
		}

		return Ok(undefined);
	}
}

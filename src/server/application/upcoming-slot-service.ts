import type {
	ChannelDatabaseRepositoryInterface,
	UpcomingSlotDatabaseRepositoryInterface,
} from "./interfaces";

export class UpcomingSlotService {
	constructor(
		private upcomingSlotDatabaseRepository: UpcomingSlotDatabaseRepositoryInterface,
		private channelDatabaseRepository: ChannelDatabaseRepositoryInterface,
	) {}

	async getUpcomingSlots() {
		const getUpcomingSlotsResult =
			await this.upcomingSlotDatabaseRepository.getUpcomingSlots();
		return getUpcomingSlotsResult.match(
			(upcomingSlots) => upcomingSlots,
			(error) => {
				console.error("Failed to get upcoming slots:", error);
				return [];
			},
		);
	}

	async initializeUpcomingSlots() {
		const getChannelsResult =
			await this.channelDatabaseRepository.getChannels();
		const channels = getChannelsResult.match(
			(channels) => channels,
			(error) => {
				console.error("Failed to get channels:", error);
				return [];
			},
		);
		const initializeResult =
			await this.upcomingSlotDatabaseRepository.initializeSlotsWithUpcomingDate(
				channels,
			);
		return initializeResult.match(
			() => {
				return { success: true };
			},
			(error) => {
				console.error("Failed to initialize upcoming slots:", error);
				return { success: false };
			},
		);
	}

	async deleteUpcomingSlot(channelId: string) {
		const deleteUpcomingSlotResult =
			await this.upcomingSlotDatabaseRepository.deleteUpcomingSlot(channelId);
		return deleteUpcomingSlotResult.match(
			() => {
				return { success: true };
			},
			(error) => {
				console.error("Failed to delete upcoming slot:", error);
				return { success: false, error: error.message };
			},
		);
	}

	async registerUsersToChannel(channelId: string, userIds: string[]) {
		const result = await this.upcomingSlotDatabaseRepository.registerUsers(
			channelId,
			userIds,
		);
		return result.match(
			() => ({ success: true }),
			(error) => {
				console.error("Failed to register users:", error);
				return { success: false, error: error.message };
			},
		);
	}

	async removeUsersFromChannel(channelId: string, userIds: string[]) {
		const result = await this.upcomingSlotDatabaseRepository.removeUsers(
			channelId,
			userIds,
		);
		return result.match(
			() => ({ success: true }),
			(error) => {
				console.error("Failed to remove users:", error);
				return { success: false, error: error.message };
			},
		);
	}

	async changeDate(channelId: string, isoString: string) {
		const result = await this.upcomingSlotDatabaseRepository.changeDate(
			channelId,
			isoString,
		);
		return result.match(
			() => ({ success: true }),
			(error) => {
				console.error("Failed to change date:", error);
				return { success: false, error: error.message };
			},
		);
	}
}

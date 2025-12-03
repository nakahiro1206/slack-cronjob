import type { Channel } from "../domain/entities";
import type { ChannelDatabaseRepositoryInterface } from "./interfaces";

export class ChannelService {
	constructor(
		private channelDatabaseRepository: ChannelDatabaseRepositoryInterface,
	) {}

	getAllChannels = async (): Promise<Channel[]> => {
		const result = await this.channelDatabaseRepository.getChannels();
		return result.match(
			(channels) => channels,
			(error) => {
				console.error("Failed to get channels:", error);
				return [];
			},
		);
	};

	addChannel = async (
		input: Channel,
	): Promise<{ success: boolean; error?: string }> => {
		const result = await this.channelDatabaseRepository.addChannel(input);
		return result.match<{ success: boolean }>(
			() => ({ success: true }),
			(error) => {
				console.error("Failed to add channel:", error);
				return { success: false };
			},
		);
	};

	updateChannel = async (
		input: Pick<Channel, "channelId" | "channelName" | "day">,
	): Promise<{ success: boolean; error?: string }> => {
		const result = await this.channelDatabaseRepository.updateChannel(
			input.channelId,
			{
				channelName: input.channelName,
				day: input.day,
			},
		);
		return result.match<{ success: boolean }>(
			() => {
				return { success: true };
			},
			(error) => {
				console.error("Failed to update channel:", error);
				return { success: false };
			},
		);
	};
	deleteChannel = async (
		channelId: string,
	): Promise<{ success: boolean; error?: string }> => {
		const result =
			await this.channelDatabaseRepository.deleteChannel(channelId);
		return result.match<{ success: boolean }>(
			() => {
				return { success: true };
			},
			(error) => {
				console.error("Failed to delete channel:", error);
				return { success: false, error: error.message };
			},
		);
	};
	registerUsers = async (
		channelId: string,
		userIds: string[],
	): Promise<{ success: boolean; error?: string }> => {
		const result = await this.channelDatabaseRepository.registerUsers(
			channelId,
			userIds,
		);
		return result.match<{ success: boolean }>(
			() => {
				return { success: true };
			},
			(error) => {
				console.error("Failed to register users to channel:", error);
				return { success: false, error: error.message };
			},
		);
	};

	removeUsers = async (
		channelId: string,
		userIds: string[],
	): Promise<{ success: boolean; error?: string }> => {
		const result = await this.channelDatabaseRepository.removeUsers(
			channelId,
			userIds,
		);
		return result.match<{ success: boolean }>(
			() => {
				return { success: true };
			},
			(error) => {
				console.error("Failed to remove users from channel:", error);
				return { success: false, error: error.message };
			},
		);
	};
}

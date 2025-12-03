import type { UserDatabaseRepositoryInterface } from "./interfaces";

export class UserService {
	constructor(
		private userDatabaseRepository: UserDatabaseRepositoryInterface,
	) {}

	getAllUsers = async (): Promise<
		{ id: string; name: string; huddleUrl: string | undefined }[]
	> => {
		const result = await this.userDatabaseRepository.getUsers();
		return result.match(
			(users) =>
				users.map((user) => ({
					id: user.userId,
					name: user.userName,
					huddleUrl: user.huddleUrl,
				})),
			(error) => {
				console.error("Failed to get users:", error);
				return [];
			},
		);
	};

	addUser = async (input: {
		id: string;
		name: string;
		url?: string | undefined;
	}): Promise<{ success: boolean }> => {
		const result = await this.userDatabaseRepository.addUser({
			userId: input.id,
			userName: input.name,
			huddleUrl: input.url,
		});
		return result.match<{ success: boolean }>(
			() => ({ success: true }),
			(error) => {
				console.error("Failed to add user:", error);
				return { success: false };
			},
		);
	};

	updateUser = async (input: {
		id: string;
		name: string;
		url: string;
	}): Promise<{ success: boolean }> => {
		const result = await this.userDatabaseRepository.updateUser({
			userId: input.id,
			userName: input.name,
			huddleUrl: input.url,
		});
		return result.match<{ success: boolean }>(
			() => {
				return { success: true };
			},
			(error) => {
				console.error("Failed to update user:", error);
				return { success: false };
			},
		);
	};

	deleteUser = async (userId: string): Promise<{ success: boolean }> => {
		const result = await this.userDatabaseRepository.deleteUser(userId);
		return result.match<{ success: boolean }>(
			() => {
				return { success: true };
			},
			(error) => {
				console.error("Failed to delete user:", error);
				return { success: false };
			},
		);
	};
}

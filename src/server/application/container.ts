import {
	NewMessengerRepository,
	NewLlmRepository,
	NewUserDatabaseRepository,
	NewUpcomingSlotsDatabaseRepository,
	NewChannelDatabaseRepository,
} from "./di";
import { NotificationService } from "./notification-service";
import { UserService } from "./user-service";
import { ChannelService } from "./channel-service";

const llmRepository = NewLlmRepository();
const messengerRepository = NewMessengerRepository();
const userDatabaseRepository = NewUserDatabaseRepository();
const upcomingSlotDatabaseRepository = NewUpcomingSlotsDatabaseRepository();
const channelDatabaseRepository = NewChannelDatabaseRepository();

export const notificationService = new NotificationService(
	llmRepository,
	messengerRepository,
	userDatabaseRepository,
	upcomingSlotDatabaseRepository,
	channelDatabaseRepository,
);

export const userService = new UserService(userDatabaseRepository);
export const channelService = new ChannelService(channelDatabaseRepository);

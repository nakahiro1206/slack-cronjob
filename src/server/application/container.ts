import { ChannelService } from "./channel-service";
import {
	NewChannelDatabaseRepository,
	NewLlmRepository,
	NewMessengerRepository,
	NewUpcomingSlotsDatabaseRepository,
	NewUserDatabaseRepository,
} from "./di";
import { NotificationService } from "./notification-service";
import { UpcomingSlotService } from "./upcoming-slot-service";
import { UserService } from "./user-service";

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
export const upcomingSlotService = new UpcomingSlotService(
	upcomingSlotDatabaseRepository,
	channelDatabaseRepository,
);

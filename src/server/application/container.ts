import { ChannelService } from "./channel-service";
import { NewChannelDatabaseRepository } from "../infrastructure/database/channel-database-repository";
import { NewLlmRepository } from "../infrastructure/llm/llm-repository";
import { NewMessengerRepository } from "../infrastructure/messenger/messenger-repository";
import { NewUpcomingSlotDatabaseRepository } from "../infrastructure/database/upcoming-slot-database-repository";
import { NewUserDatabaseRepository } from "../infrastructure/database/user-database-repository";
import { NotificationService } from "./notification-service";
import { UpcomingSlotService } from "./upcoming-slot-service";
import { UserService } from "./user-service";

const llmRepository = NewLlmRepository();
const messengerRepository = NewMessengerRepository();
const userDatabaseRepository = NewUserDatabaseRepository();
const upcomingSlotDatabaseRepository = NewUpcomingSlotDatabaseRepository();
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

import {
	NewMessengerRepository,
	NewLlmRepository,
	NewUserDatabaseRepository,
} from "./di";
import { NotificationService } from "./notification-service";
import { UserService } from "./user-service";

const llmRepository = NewLlmRepository();
const messengerRepository = NewMessengerRepository();
const userDatabaseRepository = NewUserDatabaseRepository();

export const notificationService = new NotificationService(
	llmRepository,
	messengerRepository,
	userDatabaseRepository,
);

export const userService = new UserService(userDatabaseRepository);

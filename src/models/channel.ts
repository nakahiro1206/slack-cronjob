import { type User } from "./user";

export type Channel = {
    channelId: string;
    channelName: string;
    users: User[];
}
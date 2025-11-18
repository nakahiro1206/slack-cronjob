import { z } from "zod";
// TODO: remove purpleblock import
import type { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse";

export const UserTagsAssignmentSchema = z.object({
	offline: z.array(z.string()), // Array of User Mention
	online: z.array(z.string()), // Array of User Mention
});

export type UserTagsAssignment = z.infer<typeof UserTagsAssignmentSchema>;

export type MessageParam = {
	role: "system" | "user" | "assistant";
	content: string;
};

export type ThreadMessage = {
	role: "assistant" | "user";
	ts: string | undefined;
	isBot: boolean;
	botId: string | undefined;
	appId: string | undefined;
	user: string | undefined;
	text: string;
	blocks: PurpleBlock[] | undefined;
};

export const dayEnum = z.enum([
	"FRIDAY",
	"MONDAY",
	"SATURDAY",
	"SUNDAY",
	"THURSDAY",
	"TUESDAY",
	"WEDNESDAY",
]);
export type DayEnum = z.infer<typeof dayEnum>;

export const channelSchema = z.object({
	channelId: z.string().min(1),
	channelName: z.string().min(1),
	userIds: z.array(z.string()),
	day: dayEnum,
});

export const upcomingSlotSchema = z.object({
	...channelSchema.shape,
	date: z.string().min(1),
});

export type Channel = z.infer<typeof channelSchema>;
export type UpcomingSlot = z.infer<typeof upcomingSlotSchema>;

export const userSchema = z.object({
	userId: z.string().min(1),
	userName: z.string().min(1),
	huddleUrl: z.string().url().optional(),
});

export type User = z.infer<typeof userSchema>;

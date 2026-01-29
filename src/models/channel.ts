import { z } from "zod";

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
	completedUserIds: z.array(z.string()),
});

export type Channel = z.infer<typeof channelSchema>;
export type UpcomingSlot = z.infer<typeof upcomingSlotSchema>;

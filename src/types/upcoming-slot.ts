import { z } from "zod";
import { channelSchema } from "./channel";

const upcomingSlotSchema = channelSchema
	.pick({
		channelId: true,
		channelName: true,
	})
	.extend({
		date: z.string().min(1),
		onlineUserIds: z.array(z.string()),
		offlineUserIds: z.array(z.string()),
	});

export type UpcomingSlot = z.infer<typeof upcomingSlotSchema>;

import { userSchema } from "./user";
import { z } from "zod";

export const channelSchema = z.object({
    channelId: z.string(),
    channelName: z.string(),
    userIds: z.array(z.string()),
});

export type Channel = z.infer<typeof channelSchema>;
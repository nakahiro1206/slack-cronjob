import { z } from "zod";

export const dayEnum = z.enum([
    'FRIDAY',
    'MONDAY',
    'SATURDAY',
    'SUNDAY',
    'THURSDAY',
    'TUESDAY',
    'WEDNESDAY',
]);

export const channelSchema = z.object({
    channelId: z.string().min(1),
    channelName: z.string().min(1),
    userIds: z.array(z.string()),
    day: dayEnum,
});

export type Channel = z.infer<typeof channelSchema>;
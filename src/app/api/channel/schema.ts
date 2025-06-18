import { z } from "zod";
import { channelSchema } from "@/models/channel";

export const getChannelsResponseSchema = z.object({
    channels: z.array(channelSchema),
});
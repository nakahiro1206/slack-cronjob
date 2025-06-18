import { z } from "zod";

export const registerUserRequestSchema = z.object({
    userId: z.string(),
});
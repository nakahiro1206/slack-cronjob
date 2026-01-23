import { z } from "zod";

export const userSchema = z.object({
	userId: z.string().min(1),
	userName: z.string().min(1),
	huddleUrl: z.string().url().nullable(),
});

export type User = z.infer<typeof userSchema>;

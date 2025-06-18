import {z} from 'zod';

export const userSchema = z.object({
    userId: z.string(),
    userName: z.string(),
});

export type User = z.infer<typeof userSchema>;

import { z } from "zod";
import { userSchema } from "@/models/user";

export const getUsersResponseSchema = z.object({
    users: z.array(userSchema),
});
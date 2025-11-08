import { z } from "zod";
import { publicProcedure, router } from "../server";

export const simpleRouter = router({
	hello: publicProcedure
		.input(z.object({ name: z.string().optional() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.name ?? "world"}!`,
				timestamp: new Date().toISOString(),
			};
		}),

	echo: publicProcedure.input(z.string()).mutation(({ input }) => {
		return {
			message: `You said: ${input}`,
			timestamp: new Date().toISOString(),
		};
	}),
});

import { router } from "../server";
import { authRouter } from "./auth";
import { channelRouter } from "./channel";
import { cronjobRouter } from "./cronjob";
import { simpleRouter } from "./simple";
import { upcomingRouter } from "./upcoming";
import { userRouter } from "./user";

export const appRouter = router({
	simple: simpleRouter,
	user: userRouter,
	channel: channelRouter,
	cronjob: cronjobRouter,
	auth: authRouter,
	upcoming: upcomingRouter,
});

export type AppRouter = typeof appRouter;

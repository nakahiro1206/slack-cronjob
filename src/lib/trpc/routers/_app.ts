import { router } from '../server';
import { channelRouter } from './channel';
import { cronjobRouter } from './cronjob';
import { simpleRouter } from './simple';
import { userRouter } from './user';
import { authRouter } from './auth';
import { upcomingRouter } from './upcoming';

export const appRouter = router({
  simple: simpleRouter,
  user: userRouter,
  channel: channelRouter,
  cronjob: cronjobRouter,
  auth: authRouter,
  upcoming: upcomingRouter,
});

export type AppRouter = typeof appRouter; 
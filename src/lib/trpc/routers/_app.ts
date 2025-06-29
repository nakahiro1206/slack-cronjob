import { router } from '../server';
import { channelRouter } from './channel';
import { cronjobRouter } from './cronjob';
import { simpleRouter } from './simple';
import { userRouter } from './user';
import { authRouter } from './auth';

export const appRouter = router({
  simple: simpleRouter,
  user: userRouter,
  channel: channelRouter,
  cronjob: cronjobRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter; 
// https://github.com/vercel-partner-solutions/slack-bolt-with-next

import { createHandler } from "@vercel/slack-bolt";
import { app, receiver } from "@/server/presentation/bolt";
export const POST = createHandler(app, receiver);

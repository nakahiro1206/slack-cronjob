import { App } from "@slack/bolt";
import { VercelReceiver } from "@vercel/slack-bolt";
import { register as registerAction } from "./listeners/action";
import { register as registerEvent } from "./listeners/event";

const receiver = new VercelReceiver();

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	receiver,
	deferInitialization: true,
});

registerAction(app);
registerEvent(app);

export { app, receiver };

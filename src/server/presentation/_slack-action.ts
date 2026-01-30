/**
 * To handle reply to Slack post properly,
 * filter the thread root message is bot's message and
 * sender is not bot,
 * then update the thread root message.
 */

import { App, HTTPReceiver } from "@slack/bolt";
import { WebClient } from "@slack/web-api";

export const receiver = new HTTPReceiver({
	signingSecret: process.env.SLACK_SIGNING_SECRET || "",
	processBeforeResponse: true,
	endpoints: "/api/slack/events",
});

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	ignoreSelf: true,
	receiver,
});

receiver.init(app);

// Store message timestamps for updating (in a real app, you'd use a database)
const _messageStore = new Map<string, string>();

// Initialize Slack client for API calls
const _slack = new WebClient(process.env.SLACK_BOT_TOKEN);

app.action("button-action", async ({ ack }) => {
	// This handles the existing link button clicks (url buttons still trigger action)
	await ack();
});

app.action("toggle_1on1_progress", async ({ ack, body, client }) => {
	await ack();

	if (body.type !== "block_actions" || !body.channel?.id || !body.message?.ts) {
		return;
	}

	const userId = body.user.id;
	const channelId = body.channel.id;
	const messageTs = body.message.ts;
	const _action = body.actions[0];

	// Toggle the state and post update
	const statusText = "toggled 1on1 progress";

	await client.chat.postMessage({
		channel: channelId,
		thread_ts: messageTs,
		text: `<@${userId}> ${statusText}`,
	});
});

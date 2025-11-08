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
const messageStore = new Map<string, string>();

// Initialize Slack client for API calls
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

app.event("message", async ({ event, say, client }) => {
	const messageEvent = event as any;
	const text = messageEvent.text;
	const channel = messageEvent.channel;
	const user = messageEvent.user;
	const threadTs = messageEvent.thread_ts;
	const ts = messageEvent.ts;

	// Handle different types of messages
	if (text) {
		// Check if this is a reply (has thread_ts)
		if (threadTs) {
			// This is a reply to a message
			await handleReply({ text, channel, user, threadTs, ts, client });
		} else {
			// This is a new message
			await handleNewMessage({ text, channel, user, ts, client });
		}
	}
});

// Handle new messages
async function handleNewMessage({
	text,
	channel,
	user,
	ts,
	client,
}: {
	text: string;
	channel: string;
	user: string;
	ts: string;
	client: any;
}) {
	// Store the message timestamp for potential updates
	const messageKey = `${channel}:${ts}`;
	messageStore.set(messageKey, ts);

	// Check for specific commands or patterns
	if (text.startsWith("/update")) {
		// Handle update command
		await handleUpdateCommand({ text, channel, user, ts, client });
	} else {
		// Regular message handling
		const response = await client.chat.postMessage({
			channel,
			text: `Received your message: "${text}"`,
			thread_ts: ts, // Reply in thread
		});
	}
}

// Handle replies
async function handleReply({
	text,
	channel,
	user,
	threadTs,
	ts,
	client,
}: {
	text: string;
	channel: string;
	user: string;
	threadTs: string;
	ts: string;
	client: any;
}) {
	// Store the reply timestamp
	const replyKey = `${channel}:${ts}`;
	messageStore.set(replyKey, ts);

	// Handle reply-specific logic
	if (text.startsWith("/edit")) {
		// Handle edit command for the parent message
		await handleEditCommand({ text, channel, user, threadTs, client });
	} else {
		// Regular reply handling
		await client.chat.postMessage({
			channel,
			text: `Reply received: "${text}"`,
			thread_ts: threadTs,
		});
	}
}

// Handle update command
async function handleUpdateCommand({
	text,
	channel,
	user,
	ts,
	client,
}: {
	text: string;
	channel: string;
	user: string;
	ts: string;
	client: any;
}) {
	const parts = text.split(" ");
	if (parts.length < 3) {
		await client.chat.postMessage({
			channel,
			text: "Usage: /update <message_id> <new_text>",
			thread_ts: ts,
		});
		return;
	}

	const messageId = parts[1];
	const newText = parts.slice(2).join(" ");

	try {
		// Update the specified message
		const result = await slack.chat.update({
			channel,
			ts: messageId,
			text: newText,
		});

		if (result.ok) {
			await client.chat.postMessage({
				channel,
				text: `✅ Message updated successfully!`,
				thread_ts: ts,
			});
		} else {
			await client.chat.postMessage({
				channel,
				text: `❌ Failed to update message: ${result.error}`,
				thread_ts: ts,
			});
		}
	} catch (error) {
		await client.chat.postMessage({
			channel,
			text: `❌ Error updating message: ${error}`,
			thread_ts: ts,
		});
	}
}

// Handle edit command for replies
async function handleEditCommand({
	text,
	channel,
	user,
	threadTs,
	client,
}: {
	text: string;
	channel: string;
	user: string;
	threadTs: string;
	client: any;
}) {
	const parts = text.split(" ");
	if (parts.length < 2) {
		await client.chat.postMessage({
			channel,
			text: "Usage: /edit <new_text>",
			thread_ts: threadTs,
		});
		return;
	}

	const newText = parts.slice(1).join(" ");

	try {
		// Update the parent message in the thread
		const result = await slack.chat.update({
			channel,
			ts: threadTs,
			text: newText,
		});

		if (result.ok) {
			await client.chat.postMessage({
				channel,
				text: `✅ Parent message updated successfully!`,
				thread_ts: threadTs,
			});
		} else {
			await client.chat.postMessage({
				channel,
				text: `❌ Failed to update parent message: ${result.error}`,
				thread_ts: threadTs,
			});
		}
	} catch (error) {
		await client.chat.postMessage({
			channel,
			text: `❌ Error updating parent message: ${error}`,
			thread_ts: threadTs,
		});
	}
}

app.command("/hello", async ({ command, ack, say }) => {
	await ack();
	await say(`Hello <@${command.user_id}>!`);
});

// Add a command to update any message
app.command("/update-message", async ({ command, ack, respond }) => {
	await ack();

	const text = command.text;
	const parts = text.split(" ");

	if (parts.length < 2) {
		await respond({
			text: "Usage: /update-message <message_timestamp> <new_text>",
			response_type: "ephemeral",
		});
		return;
	}

	const messageTs = parts[0];
	const newText = parts.slice(1).join(" ");

	try {
		const result = await slack.chat.update({
			channel: command.channel_id,
			ts: messageTs,
			text: newText,
		});

		if (result.ok) {
			await respond({
				text: "✅ Message updated successfully!",
				response_type: "ephemeral",
			});
		} else {
			await respond({
				text: `❌ Failed to update message: ${result.error}`,
				response_type: "ephemeral",
			});
		}
	} catch (error) {
		await respond({
			text: `❌ Error updating message: ${error}`,
			response_type: "ephemeral",
		});
	}
});

export { app, messageStore };

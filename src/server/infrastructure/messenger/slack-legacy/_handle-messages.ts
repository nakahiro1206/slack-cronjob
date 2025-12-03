// // Maybe this file is irrelevant for this project functionality

// import type {
// 	AssistantThreadStartedEvent,
// 	GenericMessageEvent,
// } from "@slack/web-api";
// import { generateResponse } from "../../server/infrastructure/llm/llm-repository";
// import { client, getThread, updateStatusUtil } from "./utils";

// type MessageParam = {
// 	role: "user" | "assistant";
// 	content: string;
// };

// export async function assistantThreadMessage(
// 	event: AssistantThreadStartedEvent,
// ) {
// 	const { channel_id, thread_ts } = event.assistant_thread;
// 	console.log(`Thread started: ${channel_id} ${thread_ts}`);
// 	console.log(JSON.stringify(event));

// 	await client.chat.postMessage({
// 		channel: channel_id,
// 		thread_ts: thread_ts,
// 		text: "Hello, I'm an AI assistant built with the AI SDK by Vercel!",
// 	});

// 	await client.assistant.threads.setSuggestedPrompts({
// 		channel_id: channel_id,
// 		thread_ts: thread_ts,
// 		prompts: [
// 			{
// 				title: "Get the weather",
// 				message: "What is the current weather in London?",
// 			},
// 			{
// 				title: "Get the news",
// 				message: "What is the latest Premier League news from the BBC?",
// 			},
// 		],
// 	});
// }

// export async function handleNewAssistantMessage(
// 	event: GenericMessageEvent,
// 	botUserId: string,
// ) {
// 	if (
// 		event.bot_id ||
// 		event.bot_id === botUserId ||
// 		event.bot_profile ||
// 		!event.thread_ts
// 	)
// 		return;

// 	const { thread_ts, channel } = event;
// 	const updateStatus = updateStatusUtil(channel, thread_ts);
// 	await updateStatus("is thinking...");

// 	const messages = await getThread(channel, thread_ts, botUserId);
// 	const queries: MessageParam[] = messages.map((m) => ({
// 		role: m.role,
// 		content: m.text,
// 	}));
// 	const result = await generateResponse(queries, updateStatus);

// 	await client.chat.postMessage({
// 		channel: channel,
// 		thread_ts: thread_ts,
// 		text: JSON.stringify(result),
// 		unfurl_links: false,
// 		blocks: [
// 			{
// 				type: "section",
// 				text: {
// 					type: "mrkdwn",
// 					text: JSON.stringify(result),
// 				},
// 			},
// 		],
// 	});

// 	await updateStatus("");
// }

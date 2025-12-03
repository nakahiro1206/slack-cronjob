// import { WebClient } from "@slack/web-api";
// import { Random } from "random";
// import {
// 	getJapanTimeAsObject,
// 	isSameDateWithTodayJapanTime,
// 	isSameOrBeforeTodayJapanTime,
// } from "@/lib/date";
// import {
// 	getUpcomingSlots,
// 	initializeNextWeekSlots,
// } from "@/lib/firebase/upcoming";
// import type { Channel } from "@/models/channel";
// import { createSlackMessageBlocks } from "./schema";
// import { getUsers } from "../firebase/user";
// import { User } from "@/models/user";

// type NotifyResult = {
// 	success: boolean;
// 	message: string | undefined;
// };

// async function postMessage({
// 	slack,
// 	channel,
// 	hour,
// 	minute,
// 	day,
// 	month,
// 	date,
// 	year,
// 	rng,
// 	users,
// }: {
// 	slack: WebClient;
// 	channel: Channel;
// 	hour: number;
// 	minute: number;
// 	day: string;
// 	month: string;
// 	date: number;
// 	year: number;
// 	rng: Random;
// 	users: User[];
// }): Promise<{
// 	channelName: string;
// 	ok: boolean;
// 	error?: string;
// }> {
// 	// Create user mentions for the channel members
// 	const shuffledUserIds = channel.userIds.sort(() => rng.float(0, 1) - 0.5);
// 	const userMentions = shuffledUserIds.map((userId) => `<@${userId}>`);

// 	const result = await slack.chat.postMessage({
// 		channel: channel.channelId,
// 		text: "1on1 order",
// 		blocks: createSlackMessageBlocks({
// 			top: {
// 				// this message is posted in the morning of the day of meeting.
// 				left: `*📣 1on1 order for ${channel.channelName}* \n This order is for the meeting on ${day}, ${month} ${date}, ${year}.`,
// 				right: `*⏰ Created at (UTC+9):*\n ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${day}, ${month} ${date}, ${year}`,
// 			},
// 			mainContent: {
// 				offline: userMentions,
// 				online: [],
// 			},
// 			bottomContent:
// 				"Want to edit the upcoming slot? \n Visit https://slack-cronjob.vercel.app/",
// 			users: users,
// 		}),
// 	});
// 	return {
// 		channelName: channel.channelName,
// 		ok: result.ok,
// 		error: result.error,
// 	};
// }

// type NotifyArgs = {
// 	updateSlot: boolean;
// } & (
// 	| {
// 			mode: "sameDayOnly";
// 	  }
// 	| {
// 			mode: "specifiedChannels";
// 			channelIds: string[];
// 	  }
// );

// export const notify = async (args: NotifyArgs): Promise<NotifyResult> => {
// 	// Initialize Slack client
// 	const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// 	// Extract date and day information
// 	const { hour, minute, date, day, month, year } = getJapanTimeAsObject();

// 	const rng = new Random(`${new Date().toISOString()}`);

// 	const usersResult = await getUsers();
// 	const users = usersResult.match(
// 		(users) => users,
// 		(error) => {
// 			console.error("Failed to get users:", error);
// 			return [];
// 		},
// 	);

// 	try {
// 		// Get all available channels
// 		const getChannelsResult = await getUpcomingSlots();
// 		const channels = getChannelsResult.match(
// 			(channels) => channels,
// 			(error) => [],
// 		);

// 		if (channels.length === 0) {
// 			return {
// 				success: false,
// 				message: "No channels found",
// 			};
// 		}

// 		let targetChannels: Channel[] = [];
// 		if (args.mode === "sameDayOnly") {
// 			targetChannels = channels.filter((channel) => {
// 				return isSameDateWithTodayJapanTime(channel.date);
// 			});
// 		} else if (args.mode === "specifiedChannels") {
// 			// This mode is basically test mode. so it should bypass date check.
// 			targetChannels = channels.filter((channel) =>
// 				args.channelIds.includes(channel.channelId),
// 			);
// 		} else {
// 			return {
// 				success: false,
// 				message: "Invalid mode",
// 			};
// 		}

// 		const results = await Promise.all(
// 			targetChannels.map(async (channel) => {
// 				return postMessage({
// 					slack,
// 					channel,
// 					hour,
// 					minute,
// 					day,
// 					month,
// 					date,
// 					year,
// 					rng,
// 					users,
// 				});
// 			}),
// 		);

// 		if (args.updateSlot) {
// 			const outdatedChannels = channels.filter((c) =>
// 				isSameOrBeforeTodayJapanTime(c.date),
// 			);
// 			await initializeNextWeekSlots(outdatedChannels.map((c) => c.channelId));
// 		}

// 		const failedChannels = results
// 			.map((result) => {
// 				if (result.ok) {
// 					return undefined;
// 				} else {
// 					return result.channelName;
// 				}
// 			})
// 			.filter((channelName) => channelName !== undefined);

// 		if (failedChannels.length > 0) {
// 			return {
// 				success: false,
// 				message: `Failed to post message: ${failedChannels.join(", ")}`,
// 			};
// 		}

// 		return {
// 			success: true,
// 			message: "Message posted successfully",
// 		};
// 	} catch (error) {
// 		return {
// 			success: false,
// 			message: `Failed to post message: ${error}`,
// 		};
// 	}
// };

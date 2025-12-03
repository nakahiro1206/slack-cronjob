import type { WebClient } from "@slack/web-api";

export type UpdateMessageParams = {
	channelId: string;
	timestamp: string;
	text: string;
	blocks?: any[];
};

export type UpdateMessageResult = {
	success: boolean;
	message?: string;
	error?: string;
	timestamp?: string;
};

/**
 * Update a Slack message
 * @param slack - Slack WebClient instance
 * @param params - Parameters for updating the message
 * @returns Promise<UpdateMessageResult>
 */
export const updateMessage = async (
	slack: WebClient,
	params: UpdateMessageParams,
): Promise<UpdateMessageResult> => {
	const { channelId, timestamp, text, blocks } = params;

	try {
		// Validate required parameters
		if (!channelId || !timestamp || !text) {
			return {
				success: false,
				error: "Missing required parameters: channelId, timestamp, or text",
			};
		}

		// Prepare update payload
		const updatePayload: any = {
			channel: channelId,
			ts: timestamp,
			text: text,
		};

		// Add blocks if provided
		if (blocks && blocks.length > 0) {
			updatePayload.blocks = blocks;
		}

		// Update the message
		const result = await slack.chat.update(updatePayload);

		if (result.ok) {
			return {
				success: true,
				message: "Message updated successfully",
				timestamp: result.ts,
			};
		} else {
			return {
				success: false,
				error: result.error || "Unknown error occurred while updating message",
			};
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
};

/**
 * Update a message with rich blocks (replaces text with blocks)
 * @param slack - Slack WebClient instance
 * @param params - Parameters for updating the message
 * @returns Promise<UpdateMessageResult>
 */
export const updateMessageWithBlocks = async (
	slack: WebClient,
	params: Omit<UpdateMessageParams, "text"> & { blocks: any[] },
): Promise<UpdateMessageResult> => {
	const { channelId, timestamp, blocks } = params;

	try {
		// Validate required parameters
		if (!channelId || !timestamp || !blocks || blocks.length === 0) {
			return {
				success: false,
				error: "Missing required parameters: channelId, timestamp, or blocks",
			};
		}

		// Update the message with blocks
		const result = await slack.chat.update({
			channel: channelId,
			ts: timestamp,
			blocks: blocks,
		});

		if (result.ok) {
			return {
				success: true,
				message: "Message updated successfully with blocks",
				timestamp: result.ts,
			};
		} else {
			return {
				success: false,
				error: result.error || "Unknown error occurred while updating message",
			};
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
};

/**
 * Delete a Slack message
 * @param slack - Slack WebClient instance
 * @param channelId - Channel ID where the message is located
 * @param timestamp - Message timestamp
 * @returns Promise<UpdateMessageResult>
 */
export const deleteMessage = async (
	slack: WebClient,
	channelId: string,
	timestamp: string,
): Promise<UpdateMessageResult> => {
	try {
		// Validate required parameters
		if (!channelId || !timestamp) {
			return {
				success: false,
				error: "Missing required parameters: channelId or timestamp",
			};
		}

		// Delete the message
		const result = await slack.chat.delete({
			channel: channelId,
			ts: timestamp,
		});

		if (result.ok) {
			return {
				success: true,
				message: "Message deleted successfully",
			};
		} else {
			return {
				success: false,
				error: result.error || "Unknown error occurred while deleting message",
			};
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
};

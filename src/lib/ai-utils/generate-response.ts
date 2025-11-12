import { openai } from "@ai-sdk/openai";
import { type ModelMessage, generateObject } from "ai";
import { z } from "zod";

const GenerateResponseReturnSchema = z.object({
	offline: z.array(z.string()), // Array of User ID
	online: z.array(z.string()), // Array of User ID
})

export type GenerateResponseReturn = z.infer<typeof GenerateResponseReturnSchema>;

export const generateResponse = async (
	messages: ModelMessage[],
	updateStatus?: (status: string) => void,
): Promise<GenerateResponseReturn> => {
	const { object } = await generateObject({
		model: openai("gpt-4o"),
		schema: GenerateResponseReturnSchema,
		system: `You are a Slack bot assistant.
    - Re-organize the order based on the intial order and given user's request.
    - user tag is represented as <@user_id>. You should keep this format in your respone
    - Every user tag should be unique. If the same user is going to be mentioned multiple times across offline and online meeting, you should only remove the earlier one.
    - If the message does not contain any user tag, you should not add any user tag in your response and just return the message
    - If not specified, the order is for offline meeting. So not-specified user request will be applied to offline meeting. If user request attendance for online meeting, you should create a separate order for online meeting.
    - Online meeting is always listed before offline meeting. It would be nice if you decorate online meeting with 🌐 emoji.`,
		messages,
	});
	return object;
};

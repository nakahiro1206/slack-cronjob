import { OpenAI } from "openai";
import { Err, Ok, type Result } from "../../../lib/result";
import type { LLMRepositoryInterface } from "../../../server/application/interfaces";
import {
	type MessageParam,
	type UserTagsAssignment,
	UserTagsAssignmentSchema,
} from "../../../server/domain/entities";
import { formatUserAssignment } from "../../infrastructure/utils";

export class LlmRepository implements LLMRepositoryInterface {
	private client: OpenAI;
	constructor() {
		const client = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		this.client = client;
	}

	generateResponse = async (
		messages: MessageParam[],
		updateStatus?: (status: string) => void,
	): Promise<Result<UserTagsAssignment, Error>> => {
		const res = await this.client.chat.completions.create({
			model: "gpt-4o-2024-08-06",
			messages: [] as MessageParam[]
				.concat([
					{
						role: "system",
						content: `You are a Slack bot assistant.
- Re-organize the order based on the intial order and given user's request.
- user tag is represented as <@user_id>. In your response you should keep this format in your respone.
- Every user tag should be unique. If the same user would appear multiple times across offline and online meeting, you should only remove either one.
- If the message does not contain any user tag, you should not add any user tag in your response and just return the message
- If not specified, the order is for offline meeting. So not-specified user request will be applied to offline meeting.`,
					},
				])
				.concat(messages),
			response_format: {
				type: "json_schema",
				/**  should return { offline: string[]; online: string[] } */
				json_schema: {
					name: "GenerateResponseReturnSchema",
					strict: true,
					schema: {
						type: "object",
						properties: {
							offline: {
								type: "array",
								items: {
									type: "string",
								},
							},
							online: {
								type: "array",
								items: 
									type: "string",,
							},
						},
						required: ["offline", "online"],
						additionalProperties: false,
					},
					description: "The response containing offline and online user IDs",
				},
			},
		});
		const obj = res.choices[0].message.content;
		console.log("Raw Response from OpenAI:", obj);
		const parseObj = (o: string | null): Result<UserTagsAssignment, Error> => {
			if (o === null) {
				console.error("OpenAI returned null response");
				return Err(new Error("OpenAI returned null response"));
			}
			try {
				const parsed = JSON.parse(o);
				const result = UserTagsAssignmentSchema.safeParse(parsed);
				if (!result.success) {
					console.error("Validation error:", result.error);
					return Err(new Error("Response validation failed"));
				}
				// if the user tags are not decorated properly, add them here
				const formatted = formatUserAssignment(result.data);
				return Ok(formatted);
			} catch (e) {
				console.error("Failed to parse JSON from OpenAI response:", e);
				return Err(new Error("Failed to parse JSON from OpenAI response"));
			}
		};
		return parseObj(obj);
	};
}

const _prevPrompt = `You are a Slack bot assistant.
    - Re-organize the order based on the intial order and given user's request.
    - user tag is represented as <@user_id>. You should keep this format in your respone
    - Every user tag should be unique. If the same user is going to be mentioned multiple times across offline and online meeting, you should only remove the earlier one.
    - If the message does not contain any user tag, you should not add any user tag in your response and just return the message
    - If not specified, the order is for offline meeting. So not-specified user request will be applied to offline meeting. If user request attendance for online meeting, you should create a separate order for online meeting.
    - Online meeting is always listed before offline meeting. It would be nice if you decorate online meeting with 🌐 emoji.`;

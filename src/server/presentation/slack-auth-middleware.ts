import { WebClient } from "@slack/web-api";
import crypto from "node:crypto";
import { type Result, Ok, Err } from "@/lib/result";

class SlackAuthMiddleWare {
	constructor(
		private client: WebClient = new WebClient(process.env.SLACK_BOT_TOKEN),
		private signingSecret = process.env.SLACK_SIGNING_SECRET!,
	) {}

	async getBotId(): Promise<Result<string, Error>> {
		try {
			const { user_id: botUserId } = await this.client.auth.test();
			if (!botUserId) {
				return Err(new Error("botUserId is undefined"));
			}
			return Ok(botUserId);
		} catch (error) {
			return Err(error as Error);
		}
	}

	// See https://api.slack.com/authentication/verifying-requests-from-slack
	verifyRequest({
		request,
		rawBody,
	}: {
		request: Request;
		rawBody: string;
	}): boolean {
		// console.log('Validating Slack request')
		const timestamp = request.headers.get("X-Slack-Request-Timestamp");
		const slackSignature = request.headers.get("X-Slack-Signature");
		// console.log(timestamp, slackSignature)

		if (!timestamp || !slackSignature) {
			console.log("Missing timestamp or signature");
			return false;
		}

		// Prevent replay attacks on the order of 5 minutes
		if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 60 * 5) {
			console.log("Timestamp out of range");
			return false;
		}

		const base = `v0:${timestamp}:${rawBody}`;
		const hmac = crypto
			.createHmac("sha256", this.signingSecret)
			.update(base)
			.digest("hex");
		const computedSignature = `v0=${hmac}`;

		// Prevent timing attacks
		return crypto.timingSafeEqual(
			Buffer.from(computedSignature),
			Buffer.from(slackSignature),
		);
	}
}
export const slackAuthMiddleWare = new SlackAuthMiddleWare();

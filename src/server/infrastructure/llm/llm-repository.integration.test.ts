/**
 * @vitest-environment node
 */

import { beforeAll, describe, expect, it } from "vitest";
import { LlmRepository } from "./llm-repository";

// We will skip these tests if the API key is not in the environment
const hasApiKey = !!process.env.OPENAI_API_KEY;

// describe.skipIf() will skip this whole test suite if the condition is true
// This is crucial so your tests don't fail in CI/CD or for other devs
describe.skipIf(!hasApiKey)("generateResponse Integration Test", () => {
	// You might want to skip this test by default, too. See step 3.
	// it.skip('should...

	it("should get a real response from the OpenAI API", async () => {
		// This test will be slow because it's a real network call
		// We also set a longer timeout (e.g., 30 seconds)

		const repository = new LlmRepository();

		const response = await repository.generateResponse([
			{
				role: "user",
				content:
					"online: [<@U12345>, <@U67890>], offline: [<@U54321>, <@U09876>]",
			},
			{
				role: "user",
				content:
					"Please move <@U54321> to online meeting and <@U12345> to offline meeting.",
			},
		]);
		response.match(
			(res) => {
				expect(res).toBeDefined();
				expect(typeof res).toBe("object");
				expect(Array.isArray(res.offline)).toBe(true);
				expect(Array.isArray(res.online)).toBe(true);
			},
			(err) => {
				throw err;
			},
		);
	}, 30000); // 30-second timeout for this test
});

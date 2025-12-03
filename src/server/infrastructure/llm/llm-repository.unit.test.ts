/**
 * @vitest-environment node
 */

import { beforeAll, describe, expect, it } from "vitest";
import { formatUserAssignment } from "../utils";

describe("formatUserAssignment", () => {
	it("should format user tags correctly", () => {
		const mockUserAssignments = {
			offline: ["U12345", "U67890", "<@U54321>"],
			online: ["U54321", "U09876", "<@U09876>"],
		};
		const formatted = formatUserAssignment(mockUserAssignments);
		expect(formatted).toEqual({
			offline: ["<@U12345>", "<@U67890>", "<@U54321>"],
			online: ["<@U54321>", "<@U09876>", "<@U09876>"],
		});
	});
});

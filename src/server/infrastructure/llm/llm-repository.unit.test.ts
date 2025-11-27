/**
 * @vitest-environment node
 */


import { formatUserAssignment } from "./llm-repository";
import { describe, it, expect, beforeAll } from "vitest";

describe("formatUserAssignment", () => {
    it("should format user tags correctly", () => {
        const mockUserAssignments = {
            offline: ["U12345", "U67890", "<@U54321>"],
            online: ["U54321", "U09876", "<@U09876>"],
        }
        const formatted = formatUserAssignment(mockUserAssignments);
        expect(formatted).toEqual({
            offline: ["<@U12345>", "<@U67890>", "<@U54321>"],
            online: ["<@U54321>", "<@U09876>", "<@U09876>"],
        });
    });
});
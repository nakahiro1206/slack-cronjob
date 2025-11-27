/**
 * @vitest-environment node
 */

import { describe, it, expect } from "vitest";
import { createSlackMessageBlocks } from "./schema";

describe("createSlackMessageBlocks", () => {
    it("should create message blocks with correct structure", () => {
        const blocks = createSlackMessageBlocks({
            top: {
                left: "Left Top Content",
                right: "Right Top Content",
            },
            mainContent: {
                offline: ["<@U12345>", "<@U67890>"],
                online: ["<@U54321>"],
            },
            bottomContent: "Bottom Content Here",
            users: [],
        });

        // Basic checks to ensure blocks are created
        expect(blocks).toBeDefined();
        expect(blocks.length).toBeGreaterThan(0);
        expect(blocks[0].type).toBe("section");
    });

    it("Throws error when main content is malformed", () => {
        expect(() => {
            createSlackMessageBlocks({
                top: {
                    left: "Left Top Content",
                    right: "Right Top Content",
                },
                mainContent: {
                    offline: ["invalidUserIdFormat"],
                    online: [],
                },
                bottomContent: "Bottom Content Here",
                users: [],
            });
        }).toThrow("Invalid user mention format: invalidUserId");
    });
});
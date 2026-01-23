/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { isSameOrBeforeTodayJapanTime } from "./date";

describe("check the given date is after today Japan time", () => {
	it("should return true for outdated date", () => {
		const outdated = "2026-01-08T08:44:40.851+09:00";
		const isOutdated = isSameOrBeforeTodayJapanTime(outdated);

		const today = "2026-01-08T23:44:40.851+00:00";
		const sameday = isSameOrBeforeTodayJapanTime(today);

		expect(isOutdated).toBe(true);
		expect(sameday).toBe(true);
	});
});

import { DateTime } from "luxon";
import type { DayEnum } from "@/models/channel";

export const getJapanTime = (isoString?: string): DateTime => {
	const d = isoString ? DateTime.fromISO(isoString) : DateTime.now();
	return d.setZone("Asia/Tokyo");
};

export const getJapanTimeTomorrow = (): DateTime => {
	const d = DateTime.now().setZone("Asia/Tokyo");
	return d.plus({ days: 1 });
};

export const getJapanTimeAsJSDate = (isoString?: string): Date => {
	const d = isoString ? DateTime.fromISO(isoString) : DateTime.now();
	return d.setZone("Asia/Tokyo").toJSDate();
};

export const dayToNumber = (day: DayEnum) => {
	switch (day) {
		case "SUNDAY":
			return 7; // Luxon uses 1-7 for days, where 7 is Sunday
		case "MONDAY":
			return 1;
		case "TUESDAY":
			return 2;
		case "WEDNESDAY":
			return 3;
		case "THURSDAY":
			return 4;
		case "FRIDAY":
			return 5;
		case "SATURDAY":
			return 6;
	}
};

export const isSameDate = (date1: DateTime, date2: DateTime) => {
	return (
		date1.hasSame(date2, "day") &&
		date1.hasSame(date2, "month") &&
		date1.hasSame(date2, "year")
	);
};

export const findNextMeetingDate = (
	japanTime: DateTime,
	day: DayEnum,
): string | null => {
	const targetDayNumber = dayToNumber(day);
	const currentDayNumber = japanTime.weekday; // Luxon weekday is 1-7

	// Calculate days until next meeting
	// should be 0 ~ 6
	const daysUntilNextMeeting = (targetDayNumber - currentDayNumber + 7) % 7;

	return japanTime.plus({ days: daysUntilNextMeeting }).toISO();
};

export const dateTimeToObject = (
	date: DateTime,
): {
	year: number;
	month: string;
	date: number;
	day: string;
	hour: number;
	minute: number;
} => {
	return {
		year: date.year,
		month: date.toFormat("MMMM"),
		date: date.day,
		day: date.toFormat("EEEE"),
		hour: date.hour,
		minute: date.minute,
	};
};

export const getJapanTimeAsObject = (
	isoString?: string,
): {
	year: number;
	month: string;
	date: number;
	day: string;
	hour: number;
	minute: number;
} => {
	const japanTime = isoString ? getJapanTime(isoString) : getJapanTime();

	return {
		year: japanTime.year,
		month: japanTime.toFormat("MMMM"),
		date: japanTime.day,
		day: japanTime.toFormat("EEEE"),
		hour: japanTime.hour,
		minute: japanTime.minute,
	};
};

export const isSameDateWithTodayJapanTime = (
	targetISOString: string,
): boolean => {
	const targetJapanTime = getJapanTime(targetISOString);
	const todayJapanTime = getJapanTime();
	return isSameDate(targetJapanTime, todayJapanTime);
};

export const isSameOrBeforeTodayJapanTime = (
	targetISOString: string,
): boolean => {
	const targetJapanTime = getJapanTime(targetISOString);
	const todayJapanTime = getJapanTime();
	return targetJapanTime.startOf("day") <= todayJapanTime.startOf("day");
};

export const isFutureDateJapanTime = (targetISOString: string): boolean => {
	const targetJapanTime = getJapanTime(targetISOString);
	const nowJapanTime = getJapanTime();
	return targetJapanTime.startOf("day") > nowJapanTime.startOf("day");
};

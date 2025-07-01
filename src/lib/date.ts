import { DayEnum } from "@/models/channel";

export const getJapanTime = (isoString?: string): Date => {
    const d = isoString ? new Date(isoString) : new Date();
    // make sure the date is initialized with the correct timezone
    const japanTime = new Date(d.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
    return japanTime;
}

export const dayToNumber = (day: DayEnum) => {
    switch (day) {
        case 'SUNDAY':
            return 0;
        case 'MONDAY':
            return 1;
        case 'TUESDAY':
            return 2;
        case 'WEDNESDAY':
            return 3;
        case 'THURSDAY':
            return 4;
        case 'FRIDAY':
            return 5;
        case 'SATURDAY':
            return 6;
    }
}

const dayNumberToEnum = (day: number): DayEnum | undefined => {
    switch (day) {
        case 0:
            return 'SUNDAY';
        case 1:
            return 'MONDAY';
        case 2:
            return 'TUESDAY';
        case 3:
            return 'WEDNESDAY';
        case 4:
            return 'THURSDAY';
        case 5:
            return 'FRIDAY';
        case 6:
            return 'SATURDAY';
        default:
            return undefined;
    }
}

export const isSameDay = (date1: Date, date2: Date) => {
    return (
        date1.getDate() === date2.getDate() && 
        date1.getMonth() === date2.getMonth() && 
        date1.getFullYear() === date2.getFullYear());
}

export const findNextMeetingDate = (japanTime: Date, day: DayEnum) => {
    // Get current time in UTC+9 (Japan timezone)
    const dayOfWeek = japanTime.getDay();
    const daysUntilNextMeeting = (dayToNumber(day) - dayOfWeek + 7) % 7;
    const nextMeetingDate = new Date(japanTime);
    nextMeetingDate.setDate(japanTime.getDate() + daysUntilNextMeeting);
    return nextMeetingDate;
}

export const getJapanTimeFromISOString = (isoString: string): {
    year: number;
    month: string;
    date: number;
    day: string;
} => {
    const japanTime = getJapanTime(isoString);

    // Extract date and day information
    const hour = japanTime.getHours();
    const minute = japanTime.getMinutes();
    const date = japanTime.getDate();
    const day = japanTime.toLocaleDateString('en-US', { weekday: 'long' });
    const month = japanTime.toLocaleDateString('en-US', { month: 'long' });
    const year = japanTime.getFullYear();

    return {
        year,
        month,
        date,
        day,
    }
}
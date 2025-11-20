import { UpcomingSlotDatabaseRepositoryInterface } from "@/server/application/interfaces";
import { firebaseConfig } from "./config";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { Result } from "@/lib/result";
import type { Channel, UpcomingSlot } from "@/server/domain/entities";
import { collection, getDocs } from "firebase/firestore";
import { Err, Ok } from "@/lib/result";
import { upcomingSlotSchema } from "@/models/channel";
import {
	getJapanTime,
	findNextMeetingDate,
	getJapanTimeTomorrow,
} from "@/lib/date";
import { doc, setDoc } from "firebase/firestore";

export class UpcomingSlotDatabaseRepository
	implements UpcomingSlotDatabaseRepositoryInterface
{
	private app: FirebaseApp;
	private db: Firestore;
	constructor() {
		this.app = initializeApp(firebaseConfig);
		this.db = getFirestore(this.app);
	}
	async getUpcomingSlots(): Promise<Result<UpcomingSlot[], Error>> {
		try {
			const channelsRef = collection(this.db, "upcoming");
			const snapshot = await getDocs(channelsRef);
			const channels = snapshot.docs
				.map((doc) => {
					const parsed = upcomingSlotSchema.safeParse(doc.data());
					if (!parsed.success) {
						return undefined;
					}
					return parsed.data;
				})
				.filter((channel): channel is UpcomingSlot => channel !== undefined);
			return Ok(channels);
		} catch (error) {
			return Err<UpcomingSlot[], Error>(error as Error);
		}
	}
	async initializeThisWeekSlots(
		channels: Channel[],
	): Promise<Result<void, Error>> {
		const japanNow = getJapanTime();
		try {
			await Promise.all(
				channels.map(async (channel) => {
					const nextMeetingDate = findNextMeetingDate(japanNow, channel.day);
					const upcomingSlotRef = doc(
						collection(this.db, "upcoming"),
						channel.channelId,
					);
					await setDoc(upcomingSlotRef, {
						...channel,
						date: nextMeetingDate || "",
					});
					return Ok(undefined);
				}),
			);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
	async initializeNextWeekSlots(
		channels: Channel[],
	): Promise<Result<void, Error>> {
		const japanTomorrow = getJapanTimeTomorrow();
		try {
			await Promise.all(
				channels.map(async (channel) => {
					const nextMeetingDate = findNextMeetingDate(
						japanTomorrow,
						channel.day,
					);
					const upcomingSlotRef = doc(
						collection(this.db, "upcoming"),
						channel.channelId,
					);
					await setDoc(upcomingSlotRef, {
						...channel,
						date: nextMeetingDate || "",
					});
				}),
			);
			return Ok(undefined);
		} catch (error) {
			console.error(error);
			return Err<void, Error>(error as Error);
		}
	}
}

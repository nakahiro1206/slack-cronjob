import { type FirebaseApp, initializeApp } from "firebase/app";
import {
	collection,
	deleteDoc,
	doc,
	type Firestore,
	getDoc,
	getDocs,
	getFirestore,
	setDoc,
} from "firebase/firestore";
import { findNextMeetingDate, getJapanTime } from "@/lib/date";
import type { Result } from "@/lib/result";
import { Err, Ok } from "@/lib/result";
import { upcomingSlotSchema } from "@/models/channel";
import type { UpcomingSlotDatabaseRepositoryInterface } from "@/server/application/interfaces";
import type { Channel, UpcomingSlot } from "@/server/domain/entities";
import { firebaseConfig } from "./config";

export const NewUpcomingSlotDatabaseRepository =
	(): UpcomingSlotDatabaseRepositoryInterface => {
		return new UpcomingSlotDatabaseRepository();
	};

class UpcomingSlotDatabaseRepository
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
	async initializeSlotsWithUpcomingDate(
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
	async deleteUpcomingSlot(channelId: string): Promise<Result<void, Error>> {
		try {
			const upcomingSlotRef = collection(this.db, "upcoming");
			const docRef = doc(upcomingSlotRef, channelId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err(new Error("Upcoming slot not found"));
			}
			await deleteDoc(docRef);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
	async changeDate(channelId: string, isoString: string) {
		try {
			const upcomingSlotRef = collection(this.db, "upcoming");
			const docRef = doc(upcomingSlotRef, channelId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err<void, Error>(new Error("Upcoming slot not found"));
			}
			const parsed = upcomingSlotSchema.safeParse(docSnap.data());
			if (!parsed.success) {
				return Err<void, Error>(new Error("Invalid upcoming slot data"));
			}
			const updatedSlot: UpcomingSlot = {
				...parsed.data,
				date: isoString,
			};
			await setDoc(docRef, updatedSlot);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
	async registerUsers(channelId: string, userIds: string[]) {
		try {
			const upcomingSlotRef = collection(this.db, "upcoming");
			const docRef = doc(upcomingSlotRef, channelId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err<void, Error>(new Error("Upcoming slot not found"));
			}
			const parsed = upcomingSlotSchema.safeParse(docSnap.data());
			if (!parsed.success) {
				return Err<void, Error>(new Error("Invalid upcoming slot data"));
			}
			const updatedUsers = Array.from(
				new Set([...(parsed.data.userIds || []), ...userIds]),
			);
			const updatedSlot: UpcomingSlot = {
				...parsed.data,
				userIds: updatedUsers,
			};
			await setDoc(docRef, updatedSlot);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
	async removeUsers(channelId: string, userIds: string[]) {
		try {
			const upcomingSlotRef = collection(this.db, "upcoming");
			const docRef = doc(upcomingSlotRef, channelId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err<void, Error>(new Error("Upcoming slot not found"));
			}
			const parsed = upcomingSlotSchema.safeParse(docSnap.data());
			if (!parsed.success) {
				return Err<void, Error>(new Error("Invalid upcoming slot data"));
			}
			const updatedUsers = (parsed.data.userIds || []).filter(
				(id) => !userIds.includes(id),
			);
			const updatedSlot: UpcomingSlot = {
				...parsed.data,
				userIds: updatedUsers,
			};
			await setDoc(docRef, updatedSlot);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
}

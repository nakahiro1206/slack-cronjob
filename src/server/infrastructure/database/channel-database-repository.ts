import { ChannelDatabaseRepositoryInterface } from "../../application/interfaces";
import { Result, Ok, Err } from "@/lib/result";
import type { Channel } from "@/server/domain/entities";
import { channelSchema } from "@/server/domain/entities";
import { firebaseConfig } from "./config";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

export class ChannelDatabaseRepository
	implements ChannelDatabaseRepositoryInterface
{
	private app: FirebaseApp;
	private db: Firestore;
	constructor() {
		this.app = initializeApp(firebaseConfig);
		this.db = getFirestore(this.app);
	}
	async getChannels(): Promise<Result<Channel[], Error>> {
		try {
			const channelsRef = collection(this.db, "channels");
			const snapshot = await getDocs(channelsRef);
			const channels = snapshot.docs.map((doc) => {
				return doc.data() as Channel;
			});
			return Ok(channels);
		} catch (error) {
			return Err<Channel[], Error>(error as Error);
		}
	}
	async getChannelById(channelId: string): Promise<Result<Channel, Error>> {
		try {
			const channelsRef = collection(this.db, "channels");
			const docRef = doc(channelsRef, channelId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err(new Error("Channel not found"));
			}
			const parsed = channelSchema.safeParse(docSnap.data());
			if (!parsed.success) {
				return Err(new Error("Invalid channel data"));
			}
			return Ok(parsed.data);
		} catch (error) {
			return Err<Channel, Error>(error as Error);
		}
	}
	async addChannel(channel: Channel): Promise<Result<void, Error>> {
		try {
			const channelsRef = collection(this.db, "channels");
			const docRef = doc(channelsRef, channel.channelId);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				return Err(new Error("Channel already exists"));
			}
			await setDoc(docRef, channel);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
	async updateChannel(
		channelId: string,
		fields: Pick<Channel, "channelName" | "day">,
	): Promise<Result<void, Error>> {
		try {
			const channelsRef = collection(this.db, "channels");
			const docRef = doc(channelsRef, channelId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err(new Error("Channel not found"));
			}
			await setDoc(docRef, fields);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
	async deleteChannel(channelId: string): Promise<Result<void, Error>> {
		try {
			const channelsRef = collection(this.db, "channels");
			const docRef = doc(channelsRef, channelId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err(new Error("Channel not found"));
			}
			await deleteDoc(docRef);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
	async getChannelByUserId(userId: string): Promise<Result<Channel, Error>> {
		try {
			const channelsRef = collection(this.db, "channels");
			const snapshot = await getDocs(channelsRef);
			const channels = snapshot.docs
				.map((doc) => {
					const parsed = channelSchema.safeParse(doc.data());
					if (!parsed.success) {
						return undefined;
					}
					return parsed.data;
				})
				.filter((channel): channel is Channel => channel !== undefined);
			const channel = channels.find((channel) =>
				channel.userIds.includes(userId),
			);
			if (!channel) {
				return Err(new Error("Channel not found for the given userId"));
			}
			return Ok(channel);
		} catch (error) {
			return Err<Channel, Error>(error as Error);
		}
	}
	async registerUsers(
		channelId: string,
		userIds: string[],
	): Promise<Result<void, Error>> {
		try {
			const channelsRef = collection(this.db, "channels");
			const docRef = doc(channelsRef, channelId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err(new Error("Channel not found"));
			}
			const parsed = channelSchema.safeParse(docSnap.data());
			if (parsed.success === false) {
				return Err(new Error("data form is invalid"));
			}
			const channel = parsed.data;
			const newUserIds = new Set([...channel.userIds, ...userIds]);
			channel.userIds = Array.from(newUserIds);
			await updateDoc(docRef, channel);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
	async removeUsers(
		channelId: string,
		userIds: string[],
	): Promise<Result<void, Error>> {
		try {
			const channelsRef = collection(this.db, "channels");
			const docRef = doc(channelsRef, channelId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err(new Error("Channel not found"));
			}
			const parsed = channelSchema.safeParse(docSnap.data());
			if (parsed.success === false) {
				return Err(new Error("data form is invalid"));
			}
			const channel = parsed.data;
			channel.userIds = channel.userIds.filter((id) => !userIds.includes(id));
			await updateDoc(docRef, channel);
			return Ok(undefined);
		} catch (error) {
			return Err<void, Error>(error as Error);
		}
	}
}

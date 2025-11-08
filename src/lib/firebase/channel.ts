import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { type Channel, channelSchema } from "@/models/channel";
import { Err, Ok, type Result } from "../result";
import { db } from "./client";

export const getChannels = async (): Promise<Result<Channel[], Error>> => {
	try {
		const channelsRef = collection(db, "channels");
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
		return Ok(channels);
	} catch (error) {
		return Err<Channel[], Error>(error as Error);
	}
};

export const getChannelById = async (
	channelId: string,
): Promise<Result<Channel, Error>> => {
	try {
		const channelsRef = collection(db, "channels");
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
};

export const addChannel = async (
	channel: Channel,
): Promise<Result<void, Error>> => {
	try {
		const channelsRef = collection(db, "channels");
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
};

export const updateChannel = async (
	channelId: string,
	fields: Pick<Channel, "channelName" | "day">,
): Promise<Result<void, Error>> => {
	try {
		const channelsRef = collection(db, "channels");
		const docRef = doc(channelsRef, channelId);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			return Err(new Error("Channel not found"));
		}
		await updateDoc(docRef, fields);
		return Ok(undefined);
	} catch (error) {
		return Err<void, Error>(error as Error);
	}
};

export const deleteChannel = async (
	channelId: string,
): Promise<Result<void, Error>> => {
	try {
		const channelsRef = collection(db, "channels");
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
};

export const getChannelByUserId = async (
	userId: string,
): Promise<Result<Channel, Error>> => {
	try {
		const channelsRef = collection(db, "channels");
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
			return Err(new Error(`Channel not found for user ${userId}`));
		}
		return Ok(channel);
	} catch (error) {
		return Err<Channel, Error>(error as Error);
	}
};

export const registerUsers = async (
	channelId: string,
	userIds: string[],
): Promise<Result<void, Error>> => {
	try {
		const channelsRef = collection(db, "channels");
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
		return Err<void, Error>(new Error("Failed to register users: " + error));
	}
};

export const removeUsers = async (
	channelId: string,
	userIds: string[],
): Promise<Result<void, Error>> => {
	try {
		const channelsRef = collection(db, "channels");
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
		const newUserIds = new Set([...channel.userIds]);
		userIds.forEach((userId) => newUserIds.delete(userId));
		channel.userIds = Array.from(newUserIds);
		await updateDoc(docRef, channel);
		return Ok(undefined);
	} catch (error) {
		return Err<void, Error>(new Error("Failed to remove users: " + error));
	}
};

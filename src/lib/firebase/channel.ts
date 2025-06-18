import { db } from "./client";
import { Err, Ok, Result } from "../result";
import { Channel, channelSchema } from "@/models/channel";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";

export const getChannels = async (): Promise<Result<Channel[], Error>> => {
    try {
        const channelsRef = collection(db, 'channels');
        const snapshot = await getDocs(channelsRef);
        const channels = snapshot.docs.map((doc) => {
            const parsed = channelSchema.safeParse(doc.data());
            if (!parsed.success) {
                return undefined;
            }
            return parsed.data;
        }).filter((channel): channel is Channel => channel !== undefined);
        return Ok(channels);
    } catch (error) {
        return Err<Channel[], Error>(error as Error);
    }
}

export const getChannelById = async (channelId: string): Promise<Result<Channel, Error>> => {
    try {
        const channelsRef = collection(db, 'channels');
        const docRef = doc(channelsRef, channelId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return Err(new Error('Channel not found'));
        }
        const parsed = channelSchema.safeParse(docSnap.data());
        if (!parsed.success) {
            return Err(new Error('Invalid channel data'));
        }
        return Ok(parsed.data);
    } catch (error) {
        return Err<Channel, Error>(error as Error);
    }
}

export const addChannel = async (channel: Channel): Promise<Result<void, Error>> => {
    try {
        const channelsRef = collection(db, 'channels');
        const docRef = doc(channelsRef, channel.channelId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return Err(new Error('Channel already exists'));
        }
        await setDoc(docRef, channel);
        return Ok(undefined);
    } catch (error) {
        return Err<void, Error>(error as Error);
    }
}

export const updateChannel = async (channel: Channel): Promise<Result<void, Error>> => {
    try {
        const channelsRef = collection(db, 'channels');
        const docRef = doc(channelsRef, channel.channelId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return Err(new Error('Channel not found'));
        }
        await updateDoc(docRef, channel);
        return Ok(undefined);
    } catch (error) {
        return Err<void, Error>(error as Error);
    }
}

export const deleteChannel = async (channelId: string): Promise<Result<void, Error>> => {
    try {
        const channelsRef = collection(db, 'channels');
        const docRef = doc(channelsRef, channelId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return Err(new Error('Channel not found'));
        }
        await deleteDoc(docRef);
        return Ok(undefined);
    } catch (error) {
        return Err<void, Error>(error as Error);
    }
}

export const getChannelByUserId = async (userId: string): Promise<Result<Channel, Error>> => {
    try {
        const channelsRef = collection(db, 'channels');
        const snapshot = await getDocs(channelsRef);
        const channels = snapshot.docs.map((doc) => {
            const parsed = channelSchema.safeParse(doc.data());
            if (!parsed.success) {
                return undefined;  
            }
            return parsed.data;
        }).filter((channel): channel is Channel => channel !== undefined);
        const channel = channels.find((channel) => channel.userIds.includes(userId));
        if (!channel) {
            return Err(new Error(`Channel not found for user ${userId}`));
        }
        return Ok(channel);
    } catch (error) {
        return Err<Channel, Error>(error as Error);
    }
}

export const registerUser = async (channelId: string, userId: string): Promise<Result<void, Error>> => {
    try {
        const channelsRef = collection(db, 'channels');
        const docRef = doc(channelsRef, channelId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return Err(new Error('Channel not found'));
        }
        const channel = docSnap.data() as Channel;
        if (channel.userIds.includes(userId)) {
            return Err(new Error('User already registered'));
        }
        channel.userIds.push(userId);
        await updateDoc(docRef, channel);
        return Ok(undefined);
    } catch (error) {
        return Err<void, Error>(error as Error);
    }
}
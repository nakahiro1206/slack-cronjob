import { db } from "./client";
import { Err, Ok, Result } from "../result";
import { Channel, channelSchema, UpcomingSlot, upcomingSlotSchema } from "@/models/channel";
import { findNextMeetingDate, getJapanTime, getJapanTimeTomorrow } from "@/lib/date";
import { getChannels } from "./channel";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";

export const getUpcomingSlots = async (): Promise<Result<UpcomingSlot[], Error>> => {
    try {
        const channelsRef = collection(db, 'upcoming');
        const snapshot = await getDocs(channelsRef);
        const channels = snapshot.docs.map((doc) => {
            const parsed = upcomingSlotSchema.safeParse(doc.data());
            if (!parsed.success) {
                return undefined;
            }
            return parsed.data;
        }).filter((channel): channel is UpcomingSlot => channel !== undefined);
        return Ok(channels);
    } catch (error) {
        return Err<UpcomingSlot[], Error>(error as Error);
    }
}

export const initializeUpcomingSlots = async (): Promise<Result<void, Error>> => {
    const channelsResult = await getChannels();
    const result = channelsResult.match<Promise<Result<void, Error>>>(
        async (channels) => {
            const japanNow = getJapanTime();
            await Promise.all(
                channels.map(async (channel) => {
                const nextMeetingDate = findNextMeetingDate(japanNow,channel.day);
                const upcomingSlotRef = doc(collection(db, 'upcoming'), channel.channelId);
                await setDoc(upcomingSlotRef, {
                    ...channel,
                    date: nextMeetingDate || "",
                });
                return Ok(undefined);
            }));
            return Ok(undefined);
        },
        async (error) => {
            return Err(error);
        }
    )
    return result;
}

export const initializeNextWeekSlots = async (channelIds: string[]): Promise<void> => {
    const japanTomorrow = getJapanTimeTomorrow();
    const channelResult = await getChannels();
    return channelResult.match<Promise<void>>(
        async (channels) => {
            await Promise.all(
                channels.map(async (channel) => {
                if ( channelIds.includes(channel.channelId) === true) {
                    const nextMeetingDate = findNextMeetingDate(japanTomorrow, channel.day);
                    try {
                        const upcomingSlotRef = doc(collection(db, 'upcoming'), channel.channelId);
                        await setDoc(upcomingSlotRef, {
                            ...channel,
                            date: nextMeetingDate || "",
                        });
                        return Ok(undefined)
                    } catch (error) {
                        return Err(new Error(`${error}`))
                    }
                }
            }))
        },
        async (error) => {
            return undefined
        }
    )
}

export const getChannelById = async (channelId: string): Promise<Result<Channel, Error>> => {
    try {
        const channelsRef = collection(db, 'upcoming');
        const docRef = doc(channelsRef, channelId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return Err(new Error('Channel not found'));
        }
        const parsed = upcomingSlotSchema.safeParse(docSnap.data());
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
        const channelsRef = collection(db, 'upcoming');
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
        const channelsRef = collection(db, 'upcoming');
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
        const channelsRef = collection(db, 'upcoming');
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
        const channelsRef = collection(db, 'upcoming');
        const snapshot = await getDocs(channelsRef);
        const channels = snapshot.docs.map((doc) => {
            const parsed = upcomingSlotSchema.safeParse(doc.data());
            if (!parsed.success) {
                return undefined;  
            }
            return parsed.data;
        }).filter((channel): channel is UpcomingSlot => channel !== undefined);
        const channel = channels.find((channel) => channel.userIds.includes(userId));
        if (!channel) {
            return Err(new Error(`Channel not found for user ${userId}`));
        }
        return Ok(channel);
    } catch (error) {
        return Err<Channel, Error>(error as Error);
    }
}

export const registerUsers = async (channelId: string, userIds: string[]): Promise<Result<void, Error>> => {
    try {
        const channelsRef = collection(db, 'upcoming');
        const docRef = doc(channelsRef, channelId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return Err(new Error('Channel not found'));
        }
        const channel = docSnap.data() as Channel;
        const newUserIds = new Set([...channel.userIds, ...userIds]);
        channel.userIds = Array.from(newUserIds);
        await updateDoc(docRef, channel);
        return Ok(undefined);
    } catch (error) {
        return Err<void, Error>(new Error('Failed to register users: ' + error));
    }
}

export const removeUsers = async (channelId: string, userIds: string[]): Promise<Result<void, Error>> => {
    try {
        const channelsRef = collection(db, 'upcoming');
        const docRef = doc(channelsRef, channelId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return Err(new Error('Channel not found'));
        }
        const parsed = upcomingSlotSchema.safeParse(docSnap.data())
        if (parsed.success === false) {
            return Err(new Error('data form is invalid'))
        }
        const channel = parsed.data;
        const newUserIds = new Set([...channel.userIds]);
        userIds.forEach((userId) => newUserIds.delete(userId));
        channel.userIds = Array.from(newUserIds);
        await updateDoc(docRef, channel);
        return Ok(undefined);
    } catch (error) {
        return Err<void, Error>(new Error('Failed to remove users: ' + error));
    }
}

export const changeData = async (channelId: string, isoString: string) => {
    try {
        const channelsRef = collection(db, 'upcoming');
        const docRef = doc(channelsRef, channelId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return Err(new Error('Channel not found'));
        }
        const parsed = upcomingSlotSchema.safeParse(docSnap.data())
        if (parsed.success === false) {
            return Err(new Error('data form is invalid'))
        }
        const channel = parsed.data;
        await updateDoc(docRef, {
            ...channel,
            date: isoString,
        });
        return Ok(undefined);
    } catch (error) {
        return Err<void, Error>(new Error('Failed to remove users: ' + error));
    }
}
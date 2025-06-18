import { type Channel } from "@/models/channel";
import { type User } from "@/models/user";
import { 
    getChannels as getChannelsFirebase,
    addChannel as addChannelFirebase,
    registerUser as registerUserFirebase,
} from "@/lib/firebase/channel";
import { getUsers as getUsersFirebase } from "@/lib/firebase/user";
import { Err, Ok, Result } from "@/lib/result";

export const getChannels = async (): Promise<Result<Channel[], Error>> => {
  const result = await getChannelsFirebase();
  return result.match(
    (channels) => Ok(channels),
    (error) => {
      console.error(error);
      return Err(error);
    }
  );
};

export const addChannel = async (channel: Channel): Promise<Result<void, Error>> => {
  const result = await addChannelFirebase(channel);
  return result.match(
    () => Ok(undefined),
    (error) => {
      console.error(error);
      return Err(error);
    }
  );
};

export const getUsers = async (): Promise<User[]> => {
  const result = await getUsersFirebase();
  return result.match(
    (users) => users,
    (error) => {
      console.error(error);
      return [];
    }
  );
};

export const registerUser = async (channelId: string, userId: string): Promise<Result<void, Error>> => {
  const result = await registerUserFirebase(channelId, userId);
  return result.match(
    () => Ok(undefined),
    (error) => Err(error)
  );
};
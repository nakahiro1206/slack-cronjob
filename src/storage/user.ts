import { getUsers as getUsersFirebase, addUser as addUserFirebase } from "@/lib/firebase/user";
import { Err, Ok, Result } from "@/lib/result";
import { User } from "@/models/user";

export const getUsers = async (): Promise<Result<User[], Error>> => {
  const result = await getUsersFirebase();
  return result.match(
    (users) => Ok(users),
    (error) => Err(error)
  );
};

export const addUser = async (user: User): Promise<Result<void, Error>> => {
  const result = await addUserFirebase(user);
  return result.match(
    () => Ok(undefined),
    (error) => Err(error)
  );
};
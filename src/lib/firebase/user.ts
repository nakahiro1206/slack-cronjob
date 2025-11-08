import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { Err, Ok, type Result } from "@/lib/result";
import { type User, userSchema } from "@/models/user";
import { db } from "./client";

export const getUsers = async (): Promise<Result<User[], Error>> => {
	try {
		const usersRef = collection(db, "users");
		const snapshot = await getDocs(usersRef);
		const users = snapshot.docs
			.map((doc) => {
				const parsed = userSchema.safeParse(doc.data());
				if (!parsed.success) {
					return undefined;
				}
				return parsed.data;
			})
			.filter((user): user is User => user !== undefined);
		return Ok(users);
	} catch (error) {
		return Err<User[], Error>(error as Error);
	}
};

export const getUserById = async (
	userId: string,
): Promise<Result<User, Error>> => {
	try {
		const usersRef = collection(db, "users");
		const docRef = doc(usersRef, userId);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			return Err(new Error("User not found"));
		}
		const parsed = userSchema.safeParse(docSnap.data());
		if (!parsed.success) {
			return Err(new Error("Invalid user data"));
		}
		return Ok(parsed.data);
	} catch (error) {
		return Err<User, Error>(error as Error);
	}
};

export const addUser = async (user: User): Promise<Result<void, Error>> => {
	try {
		const usersRef = collection(db, "users");
		const docRef = doc(usersRef, user.userId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			return Err(new Error("User already exists"));
		}
		await setDoc(docRef, user);
		return Ok(undefined);
	} catch (error) {
		return Err<void, Error>(error as Error);
	}
};

export const updateUser = async (user: User): Promise<Result<void, Error>> => {
	try {
		const usersRef = collection(db, "users");
		const docRef = doc(usersRef, user.userId);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			return Err(new Error("User not found"));
		}
		await updateDoc(docRef, user);
		return Ok(undefined);
	} catch (error) {
		return Err<void, Error>(error as Error);
	}
};

export const deleteUser = async (
	userId: string,
): Promise<Result<void, Error>> => {
	try {
		const usersRef = collection(db, "users");
		const docRef = doc(usersRef, userId);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			return Err(new Error("User not found"));
		}
		await deleteDoc(docRef);
		return Ok(undefined);
	} catch (error) {
		return Err<void, Error>(error as Error);
	}
};

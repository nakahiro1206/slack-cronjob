import type { User } from "../../domain/entities";
import { UserDatabaseRepositoryInterface } from "../../application/interfaces";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { firebaseConfig } from "./config";
import { Err, Ok, type Result } from "@/lib/result";

export class UserDatabaseRepository implements UserDatabaseRepositoryInterface {
	private app: FirebaseApp;
	private db: Firestore;
	constructor() {
		this.app = initializeApp(firebaseConfig);
		this.db = getFirestore(this.app);
	}
	async getUsers(): Promise<Result<User[], Error>> {
		try {
			const usersRef = collection(this.db, "users");
			const snapshot = await getDocs(usersRef);
			const users = snapshot.docs.map((doc) => {
				return doc.data() as User;
			});
			return Ok(users);
		} catch (error) {
			return Err<User[], Error>(error as Error);
		}
	}

	async getUserById(userId: string): Promise<Result<User, Error>> {
		try {
			const usersRef = collection(this.db, "users");
			const docRef = doc(usersRef, userId);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) {
				return Err(new Error("User not found"));
			}
			return Ok(docSnap.data() as User);
		} catch (error) {
			return Err<User, Error>(error as Error);
		}
	}

	async addUser(user: User): Promise<Result<void, Error>> {
		try {
			const usersRef = collection(this.db, "users");
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
	}

	async updateUser(user: User): Promise<Result<void, Error>> {
		try {
			const usersRef = collection(this.db, "users");
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
	}

	async deleteUser(userId: string): Promise<Result<void, Error>> {
		try {
			const usersRef = collection(this.db, "users");
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
	}
}

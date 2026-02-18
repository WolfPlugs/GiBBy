import type { GuildMember } from "discord.js";
import { type Collection, MongoClient } from "mongodb";
import type { Badge } from "../types/badge.d.js";
import type { Entry } from "../types/entry.js";
import { BucketDelete, BucketUpload } from "./bucket.js";

const client = new MongoClient(process.env.MONGO_DB!);

async function connect(): Promise<Collection<Entry>> {
	await client.connect();
	const collection: Collection<Entry> = client
		.db(process.env.DATABASE_NAME)
		.collection(process.env.COLLECTION_NAME!);
	return collection;
}

const mongo = await connect();

export async function destroy(): Promise<void> {
	await client.close();
}

async function getEntry(userId: string): Promise<Entry> {
	const entry = await mongo.findOne({ userId });
	if (entry != null) {
		return entry;
	}
	const newEntry: Entry = {
		userId,
		badges: [],
		blocked: false,
	};
	await mongo.insertOne(newEntry);
	return newEntry;
}

// GETTERS

export async function isBlocked(userId: string): Promise<boolean> {
	return (await getEntry(userId)).blocked;
}

export async function getBadges(
	userId: string,
	only: "all" | "pending" | "active",
) {
	const allBadges = (await getEntry(userId)).badges;
	const returnArray: Badge[] = [];
	switch (only) {
		case "all":
			return allBadges;
		case "active":
			allBadges.forEach((badge) => {
				if (!badge.pending) returnArray.push(badge);
			});
			return returnArray;
		case "pending":
			allBadges.forEach((badge) => {
				if (badge.pending) returnArray.push(badge);
			});
			return returnArray;
	}
}

export async function getBadge(
	userId: string,
	name: string,
): Promise<Badge | undefined> {
	const foundBadge = (await getEntry(userId)).badges.find(
		(badge) => badge.name === name,
	);
	return foundBadge;
}

export async function canMakeNewBadge(user: GuildMember): Promise<boolean> {
	const entry = await getEntry(user.id);
	return !(
		entry.badges.length >=
		Number(process.env.MAX_BADGES) +
			(user.premiumSince ? Number(process.env.EXTRA_BOOST_BADGES) : 0)
	);
}

// SETTERS

export async function pendBadge(userId: string, badge: Badge): Promise<void> {
	badge.pending = true;
	await mongo.updateOne({ userId }, { $push: { badges: badge } });
}

export async function approveBadge(
	userId: string,
	name: string,
): Promise<void> {
	const badge = await getBadge(userId, name);
	if (!badge) {
		throw new Error("Badge is not pending");
	}
	const s3Url = await BucketUpload(badge.badge);
	if (!s3Url) {
		throw new Error("S3 upload failed");
	}
	await mongo.updateOne(
		{ userId, "badges.name": name },
		{ $set: { "badges.$.pending": false, "badges.$.badge": s3Url } },
	);
}

export async function blockUser(userId: string): Promise<void> {
	await mongo.updateOne({ userId }, { $set: { blocked: true } });
}

export async function unblockUser(userId: string): Promise<void> {
	await mongo.updateOne({ userId }, { $set: { blocked: false } });
}

// DELETE FUNCTIONS

export async function deleteBadge(userId: string, name: string): Promise<void> {
	const badge = await getBadge(userId, name);
	if (!badge) {
		throw new Error("Badge does not exist");
	}
	if (badge.badge.includes(process.env.BUCKET_DOMAIN!)) {
		// Badges that have not been approved will not be in the bucket
		await BucketDelete(badge.badge);
	}
	await mongo.updateOne({ userId }, { $pull: { badges: { name } } });
}

// OTHER

export async function badgeExists(
	userId: string,
	name: string,
	only: "all" | "pending" | "active",
): Promise<boolean> {
	return (await getBadges(userId, only)).some((badge) => badge.name === name);
}

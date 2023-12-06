import untypedSettings from "../config/config.json" assert { type: "json" };
import untypedCredentials from "../config/credentials.json" assert { type: "json" };
import { MongoClient, Collection } from "mongodb";
import type { Badge } from "./types/badge.d.ts";
import { Entry } from "./types/entry.js";
import { GuildMember } from "discord.js";
import { Config } from "./types/config.js";
import type { Credentials } from "./types/config.js";

const credentials: Credentials = untypedCredentials as Credentials;

const settings = untypedSettings as Config;

const client = new MongoClient(credentials.MongoDB);

async function connect(): Promise<Collection> {
    await client.connect();
    const collection: Collection = client
        .db(settings.DatabaseName)
        .collection(settings.CollectionName);
    return collection;
}

const mongo = await connect();

export async function destroy(): Promise<void> {
    await client.close();
}

export async function getEntry(userId: string): Promise<Entry> {
    let entry = (await mongo.findOne({ userId })) as Entry;
    if (entry === null) {
        await mongo.insertOne({
            userId,
            badges: [],
            blocked: false,
        });
        entry = (await mongo.findOne({ userId })) as Entry;
    }
    return entry;
}

// GETTERS

export async function isBlocked(userId: string): Promise<boolean> {
    return (await getEntry(userId))["blocked"];
}

export async function getBadges(
    userId: string,
    only: "all" | "pending" | "active",
) {
    const allBadges = (await getEntry(userId))["badges"];
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
    const foundBadge = (await getEntry(userId))["badges"].find(
        (badge) => badge.name === name,
    );
    return foundBadge;
}

export async function canMakeNewBadge(user: GuildMember): Promise<boolean> {
    const entry = await getEntry(user.id);
    return !(
        entry.badges.length >=
        settings.MaxBadges + (user.premiumSince ? settings.ExtraBoostBadges : 0)
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
    await mongo.updateOne(
        { userId, "badges.name": name },
        { $set: { "badges.$.pending": false } },
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

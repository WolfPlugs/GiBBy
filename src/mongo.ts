import settings from '../config/config.json' assert { type: 'json' };
import credentials from '../config/credentials.json' assert { type: 'json' };
import { MongoClient, Collection } from 'mongodb';
import type { Badge } from './types/badge.d.ts';
import { Entry } from './types/entry.js';

const client = new MongoClient(credentials.MongoDB);

async function connect(): Promise<Collection> {
    await client.connect();
    const collection: Collection = client
        .db(settings.DatabaseName)
        .collection(settings.CollectionName);
    return collection;
}

const mongo = await connect();

async function lint(userId: string): Promise<void> {
    // We should probably just run this against the entire database once.

    // Make entry if it doesn't exist
    const entry = await mongo.findOne({ userId });
    if (!entry) {
        await mongo.insertOne({
            userId,
            badges: [],
            pending: [],
            blocked: false,
        });
        return;
    }

    // Make new fields if they don't exist
    if (entry['pending'] === undefined) {
        await mongo.updateOne({ userId }, { $set: { pending: [] } });
    }
    if (entry['badges'] === undefined) {
        await mongo.updateOne({ userId }, { $set: { badges: [] } });
    }
    if (entry['blocked'] === undefined) {
        await mongo.updateOne({ userId }, { $set: { blocked: false } });
    }

    // Remove deprecated fields if they exist
    if (entry['badge']) {
        await mongo.updateOne({ userId }, { $unset: { badge: '' } }); // Check this actually works
    }
    if (entry['name']) {
        await mongo.updateOne({ userId }, { $unset: { name: '' } }); // Check this actually works
    }
}

export async function destroy(): Promise<void> {
    await client.close();
}

export async function getEntry(userId: string): Promise<Entry> {
    await lint(userId);
    return (await mongo.findOne({ userId })) as Entry; // Badge was ensured to be created by lint()
}

// GETTERS

export async function isBlocked(userId: string): Promise<boolean> {
    return (await getEntry(userId))['blocked'];
}

export async function getPending(userId: string): Promise<Badge[]> {
    return (await getEntry(userId))['pending'];
}

export async function getBadges(userId: string): Promise<Badge[]> {
    return (await getEntry(userId))['badges'];
}

export async function canMakeNewBadge(userId: string): Promise<boolean> {
    const entry = await getEntry(userId);
    return !(entry.badges.length + entry.pending.length >= settings.MaxBadges);
}

// SETTERS

export async function pendBadge(userId: string, badge: Badge): Promise<void> {
    await lint(userId);
    await mongo.updateOne({ userId }, { $push: { pending: badge } });
}

// DELETE FUNCTIONS ARE BROKEN

export async function deleteBadge(userId: string, name: string): Promise<void> {
    await lint(userId);
    await mongo.updateOne({ userId }, { $unset: { badges: { name } } });
}

export async function deletePending(
    userId: string,
    name: string,
): Promise<void> {
    await lint(userId);
    await mongo.updateOne({ userId }, { $unset: { pending: { name } } });
}

// OTHER

export async function badgeExists(
    userId: string,
    name: string,
): Promise<boolean> {
    return (await getBadges(userId))
        .concat(await getPending(userId))
        .some((badge) => badge.name === name);
}

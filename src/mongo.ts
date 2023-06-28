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

export async function getBadges(userId: string): Promise<Badge[]> {
    const entry = await mongo.findOne({ userId });
    if (!entry) return [];
    return entry['badges'] as Badge[];
}

async function newEntry(userId: string): Promise<void> {
    await mongo.insertOne({ userId, badges: [], pending: [] });
}

async function cleanEntry(userId: string): Promise<void> {
    // We should probably just run this against the entire database once.

    // Make entry if it doesn't exist
    const entry = await mongo.findOne({ userId });
    if (!entry) {
        await newEntry(userId);
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

export async function isBlocked(userId: string): Promise<boolean> {
    await cleanEntry(userId);
    const entry = (await mongo.findOne({ userId })) as Entry;
    return entry['blocked'];
}

export async function destroy(): Promise<void> {
    await client.close();
}

export async function getEntry(userId: string): Promise<Entry> {
    await cleanEntry(userId);
    const entry = await mongo.findOne({ userId });
    return entry as Entry;
}

export async function getPending(userId: string): Promise<Badge[]> {
    await cleanEntry(userId);
    const entry = (await mongo.findOne({ userId })) as Entry;
    return entry['pending'];
}

export async function pendBadge(userId: string, badge: Badge): Promise<void> {
    await cleanEntry(userId);
    await mongo.updateOne({ userId }, { $push: { pending: badge } });
}

export async function canMakeNewBadge(userId: string): Promise<boolean> {
    await cleanEntry(userId);
    const entry = await getEntry(userId);
    if (entry.badges.length + entry.pending.length >= settings.maxBadges) {
        return false;
    }
    return true;
}

export async function deleteBadge(userId: string, name: string): Promise<void> {
    await cleanEntry(userId);
    await mongo.updateOne({ userId }, { $pull: { badges: { name } } });
}

export async function deletePending(
    userId: string,
    name: string,
): Promise<void> {
    await cleanEntry(userId);
    await mongo.updateOne({ userId }, { $pull: { pending: { name } } });
}

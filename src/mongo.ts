import settings from '../config/config.json' assert { type: 'json' };
import credentials from '../config/credentials.json' assert { type: 'json' };
import { MongoClient, Db, Collection } from 'mongodb';
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
    return entry['badges'];
}

export async function isBlocked(userId: string): Promise<boolean> {
    const entry = await mongo.findOne({ userId });
    if (!entry) return false;
    return entry['blocked'];
}

export async function destroy(): Promise<void> {
    await client.close();
}

export async function getEntry(userId: string): Promise<Entry | false> {
    //returns the entire entry for a user
    const entry = await mongo.findOne({ userId });
    if (!entry) return false;
    return entry as Entry;
}

export async function getPending(userId: string): Promise<Badge[]> {
    const entry = await mongo.findOne({ userId });
    if (!entry || !entry['pending']) return [];
    return entry['pending'];
}

export async function pendBadge(userId: string, badge: Badge) {
    await mongo.updateOne({ userId }, { $push: { pending: badge } });
}

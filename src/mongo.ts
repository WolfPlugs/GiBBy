import untypedSettings from '../config/config.json' assert { type: 'json' };
import credentials from '../config/credentials.json' assert { type: 'json' };
import { MongoClient, Collection } from 'mongodb';
import type { Badge } from './types/badge.d.ts';
import { Entry } from './types/entry.js';
import { GuildMember } from 'discord.js';
import { Config } from './types/config.js';

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
    if (entry['badges'] === undefined) {
        await mongo.updateOne({ userId }, { $set: { badges: [] } });
    } else {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        (entry['badges'] as Badge[]).forEach(async (badge: Badge) => {
            // set badge.pending to false if it does not exist
            if (badge.pending !== true) {
                badge.pending = false;

                await mongo.updateOne(
                    { userId },
                    { $set: { badges: entry['badges'] as Badge[] } },
                );
            }
        });
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

export async function getBadges(
    userId: string,
    only: 'all' | 'pending' | 'active',
) {
    const allBadges = (await getEntry(userId))['badges'];
    const returnArray: Badge[] = [];
    switch (only) {
        case 'all':
            return allBadges;
        case 'active':
            allBadges.forEach((badge) => {
                if (!badge.pending) returnArray.push(badge);
            });
            return returnArray;
        case 'pending':
            allBadges.forEach((badge) => {
                if (badge.pending) returnArray.push(badge);
            });
            return returnArray;
    }
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
    await lint(userId);
    badge.pending = true;
    await mongo.updateOne({ userId }, { $push: { badges: badge } });
}

export async function approveBadge(
    userId: string,
    name: string,
): Promise<void> {
    await mongo.updateOne(
        { userId, 'badges.name': name },
        { $set: { 'badges.$.pending': false } },
    );
}

export async function blockUser(userId: string): Promise<void> {
    await lint(userId);
    await mongo.updateOne({ userId }, { $set: { blocked: true } });
}

export async function unblockUser(userId: string): Promise<void> {
    await lint(userId);
    await mongo.updateOne({ userId }, { $set: { blocked: false } });
}

// DELETE FUNCTIONS

export async function deleteBadge(userId: string, name: string): Promise<void> {
    await lint(userId);
    await mongo.updateOne({ userId }, { $pull: { badges: { name } } });
}

// OTHER

export async function badgeExists(
    userId: string,
    name: string,
    only: 'all' | 'pending' | 'active',
): Promise<boolean> {
    return (await getBadges(userId, only)).some((badge) => badge.name === name);
}

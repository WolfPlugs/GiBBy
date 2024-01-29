import untypedConfig from "../config/config.json" assert { type: "json" };
import { MongoClient, Collection } from "mongodb";
import type { Entry } from "../src/types/entry.js";
import type { Config } from "../src/types/config.js";
import { BucketUpload } from "../src/lib/bucket.js";

const { CollectionName, DatabaseName, MongoDB} = untypedConfig as Config;

const client = new MongoClient(MongoDB);

async function connect(): Promise<Collection> {
    await client.connect();
    const collection: Collection = client
        .db(DatabaseName)
        .collection(CollectionName);
    return collection;
}

const db = await connect();

const cursor = db.find();

for await (const x of cursor){
    const entry = x as Entry;
    const userId = entry.userId
    console.log(entry)
    if(entry.badges.length==0){
        continue;
    }
    for await (const badge of entry.badges){
        try {
            if(badge.pending){
                continue;
            }
            const s3Url = await BucketUpload(badge.badge)
            if(!s3Url){
                throw new Error("S3 upload failed")
            }
            await db.updateOne(
                { userId, "badges.name": badge.name },
                { $set: { "badges.$.badge": s3Url } },
            );
        } catch(e:unknown) {
            console.log(`Tried to upload "${badge.name}" from "${userId}". Got "${(e as Error).message}"`)
        }
    }
}
console.log("done X3")

await client.close();
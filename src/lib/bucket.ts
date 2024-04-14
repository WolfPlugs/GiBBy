import { Client } from "minio";
import { createHash } from "crypto";

import untypedConfig from "../../config/config.json" with { type: "json" };
import { Config } from "../types/config.js";

const { BucketEndpoint, BucketPort, BucketAccessKey, BucketSecretKey, BucketSSL, BucketDomain, BucketName } = untypedConfig as Config;

const minioClient = new Client({
    endPoint: BucketEndpoint,
    port: BucketPort,
    useSSL:BucketSSL,
    accessKey: BucketAccessKey,
    secretKey: BucketSecretKey
});

function mimeToExt(extension:string|null){
    switch(extension){
        case "image/webp": return ".webp";
        case "image/png": return ".png";
        case "image/jpeg": return ".jpg"
        case "image/gif": return ".gif"
        case "image/apng": return ".apng"
        default: throw(new TypeError("Unacceptable MIME"))
    }
}

export async function BucketUpload(url:string):Promise<string>{
    const name = createHash("sha1").update((Math.random()+1).toString(36).substring(2)+url).digest("hex")
    return await fetch(url).then(async (data)=>{
        const ext = mimeToExt(data.headers.get("Content-Type"))
        await minioClient.putObject(BucketName, name+ext, Buffer.from(await data.arrayBuffer())) // Don't ask me how this buffer thing works, I don't know yet
        return `${BucketDomain}/${name+ext}`
    })
}

export async function BucketDelete(url:string){
    const obj = url.split(`${BucketDomain}/`)[1]
    if(!obj){
        throw new URIError("URL does not seem to contain an object")
    }
    await minioClient.removeObject(BucketName, obj)
}
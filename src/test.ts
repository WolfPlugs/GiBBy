import { minioClient } from "./lib/bucket";
import { createHash } from "crypto";

import untypedConfig from "../config/config.json" assert { type: "json" };
import { Config } from "./types/config.js";
const { BucketName, BucketDomain } = untypedConfig as Config;

import {getMimeType} from "stream-mime-type"
import { get } from "https"
import { IncomingMessage } from "http";

function mimeToExt(extension:string){
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
    return new Promise((resolve, reject) =>{
        const name = createHash("sha1").update((Math.random()+1).toString(36).substring(2)+url).digest("hex")
        get(url, (stream)=>{
            getMimeType(stream).then(async (result)=>{
                await minioClient.putObject(BucketName, name+mimeToExt(result.mime), result.stream as IncomingMessage);
            }).catch((e)=>{reject(e)})
        })
        resolve(`${BucketDomain}/${name}`)
    })
}

console.log(await BucketUpload("https://cdn.discordapp.com/attachments/1015060231060983891/1145387171621122068/bigshiggy.gif"))
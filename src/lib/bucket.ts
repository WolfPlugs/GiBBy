import { Client } from "minio";

import untypedConfig from "../../config/config.json" assert { type: "json" };
import { Config } from "../types/config.js";

const { BucketEndpoint, BucketPort, BucketAccessKey, BucketSecretKey, BucketSSL } = untypedConfig as Config;

export const minioClient = new Client({
    endPoint: BucketEndpoint,
    port: BucketPort,
    useSSL:BucketSSL,
    accessKey: BucketAccessKey,
    secretKey: BucketSecretKey
});
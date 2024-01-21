export interface Config {
    DiscordToken: string;
    MongoDB: string;
    ClientID: string;
    DatabaseName: string;
    CollectionName: string;
    MaxBadges: number;
    ExtraBoostBadges: number;
    PromptChannel: string;
    VerifierRole: string;
    Domains: string[];
    BucketEndpoint: string;
    BucketPort: number;
    BucketSSL: boolean
    BucketAccessKey: string;
    BucketSecretKey: string;
    BucketName: string;
    BucketDomain: string;
}

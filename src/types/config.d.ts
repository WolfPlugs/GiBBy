export interface Config {
    UserId: string;
    DatabaseName: string;
    CollectionName: string;
    maxBadges: number;
    promptChannel: string;
}

export interface Credentials {
    DiscordToken: string;
    MongoDB: string;
}

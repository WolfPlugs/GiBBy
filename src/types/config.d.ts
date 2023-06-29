export interface Config {
    clientID: string;
    DatabaseName: string;
    CollectionName: string;
    maxBadges: number;
    promptChannel: string;
}

export interface Credentials {
    DiscordToken: string;
    MongoDB: string;
}

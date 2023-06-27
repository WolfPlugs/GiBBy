export interface Config {
    clientID: string;
    DatabaseName: string;
    CollectionName: string;
    maxBadges: number;
}

export interface Credentials {
    DiscordToken: string;
    MongoDB: string;
}

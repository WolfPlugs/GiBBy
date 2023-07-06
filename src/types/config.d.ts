export interface Config {
    ClientId: string;
    DatabaseName: string;
    CollectionName: string;
    MaxBadges: number;
    PromptChannel: string;
    Domains: string[];
}

export interface Credentials {
    DiscordToken: string;
    MongoDB: string;
}

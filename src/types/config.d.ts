export interface Config {
    ClientId: string;
    DatabaseName: string;
    CollectionName: string;
    MaxBadges: number;
    ExtraBoostBadges: number;
    PromptChannel: string;
    VerifierRole: string;
    Domains: string[];
}

export interface Credentials {
    DiscordToken: string;
    MongoDB: string;
}

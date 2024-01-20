export interface Config {
    DiscordToken: string;
    MongoDB: string;
    ClientId: string;
    DatabaseName: string;
    CollectionName: string;
    MaxBadges: number;
    ExtraBoostBadges: number;
    PromptChannel: string;
    VerifierRole: string;
    Domains: string[];
}

import type { ButtonInteraction, Client } from "discord.js";

export interface Button {
    id: string;
    execute: (interaction: ButtonInteraction, client: Client) => Promise<void>;
}

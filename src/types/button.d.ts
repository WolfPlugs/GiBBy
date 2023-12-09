import type { ButtonInteraction } from "discord.js";

export interface Button {
    id: string;
    execute: (interaction: ButtonInteraction) => Promise<void>;
}

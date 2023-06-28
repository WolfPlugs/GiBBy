import type {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client,
    SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

import type { Button } from './button.js';

export interface Command {
    data: SlashCommandOptionsOnlyBuilder;
    execute: (
        interaction: ChatInputCommandInteraction,
        client: Client,
    ) => Promise<void>;
    buttons?: Button[];
    autocomplete?: (
        interaction: AutocompleteInteraction,
        client: Client,
    ) => Promise<void>;
}

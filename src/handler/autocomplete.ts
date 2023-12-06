import type { AutocompleteInteraction, Client } from "discord.js";
import { Command } from "../types/command.js";

export async function handleAutocomplete(
    interaction: AutocompleteInteraction,
    client: Client,
    commands: Map<string, Command>,
) {
    const command = commands.get(interaction.commandName) as Command;
    if (!command) {
        console.error(
            `[Autocomplete Handler]: Command ${interaction.commandName} not found`,
        );
    } else if (command.autocomplete) {
        try {
            await command.autocomplete(interaction, client);
        } catch (error) {
            console.error(error);
        }
    }
}

import type { AutocompleteInteraction } from "discord.js";
import { Command } from "../types/command.js";

export async function handleAutocomplete(
    interaction: AutocompleteInteraction,
    commands: Map<string, Command>,
) {
    const command = commands.get(interaction.commandName);
    if (!command) {
        console.error(
            `[Autocomplete Handler]: Command ${interaction.commandName} not found`,
        );
    } else if (command.autocomplete) {
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
    }
}

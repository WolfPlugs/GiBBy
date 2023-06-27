import { AutocompleteInteraction, Client } from 'discord.js';

export async function handleAutocomplete(
    interaction: AutocompleteInteraction,
    client: Client,
    commands: Map<string, any>,
) {
    const command = commands.get(interaction.commandName);
    if (!command) {
        console.error(
            `[Autocomplete Handler]: Command ${interaction.commandName} not found`,
        );
        return;
    }
    try {
        await command.autocomplete(interaction, client);
    } catch (error) {
        console.error(error);
    }
}

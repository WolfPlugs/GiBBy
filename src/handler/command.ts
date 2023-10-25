import type { ChatInputCommandInteraction, Client } from 'discord.js';
import type { Command } from '../types/command.js';

export async function handleCommand(
    interaction: ChatInputCommandInteraction,
    client: Client,
    commands: Map<string, Command>,
) {
    try {
        await commands
            .get(interaction.commandName)
            ?.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content:
                'There was an error while executing this command! `debug: detected in index.ts`',
            ephemeral: true,
        });
    }
}

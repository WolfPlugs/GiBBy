import { ChatInputCommandInteraction, Client } from 'discord.js';

export async function handleCommand(
    interaction: ChatInputCommandInteraction,
    client: Client,
    commands: Map<string, any>, // TYPE THIS LATER
) {
    try {
        await commands
            .get(interaction.commandName)
            .execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        });
    }
}

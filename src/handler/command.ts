import type { ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../types/command.js";

export async function handleCommand(
    interaction: ChatInputCommandInteraction,
    commands: Map<string, Command>,
) {
    try {
        await commands.get(interaction.commandName)?.execute(interaction);
    } catch (error:unknown) {
        console.error(error);
        await interaction.reply({
            content: `There was an error while executing this command! Debug: \`${(error as Error).message}\``,
            ephemeral: true,
        });
    }
}

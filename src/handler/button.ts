import type { ButtonInteraction } from "discord.js";
import type { Command } from "../types/command.js";

export async function handleButton(
    interaction: ButtonInteraction,
    commands: Map<string, Command>,
) {
    for (const command of commands) {
        const buttons = command[1]?.buttons;
        if (!buttons) continue;

        for (let i = 0; i < buttons.length; ++i) {
            if (buttons[i]?.id === interaction.customId) {
                await buttons[i]?.execute(interaction);
            }
        }
    }
}

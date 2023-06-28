import type { ButtonInteraction, Client } from 'discord.js';
import type { Command } from '../types/command.js';
import { Button } from '../types/button.js';

export function handleButton(
    interaction: ButtonInteraction,
    client: Client,
    commands: Map<string, Command>, // TYPE THIS
): void {
    for (const command of commands) {
        const buttons = command[1]?.buttons;
        if (!buttons) continue;
        // This might not work due to not being fully async
        buttons.forEach((button: Button) => {
            async () => {
                if (button.id === interaction.customId) {
                    await button.execute(interaction, client);
                }
            };
        });
    }
}

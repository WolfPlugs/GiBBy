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
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        buttons.forEach(async (button: Button) => {
            if (button.id === interaction.customId) {
                await button.execute(interaction, client);
            }
        });
    }
}

import { ButtonInteraction, Client, Interaction } from 'discord.js';
import { isBlocked } from '../mongo.js';

// IMPLEMENT BLOCKING LATER

export async function handleInteraction(
    interaction: Interaction,
    client: Client,
    commands: Map<string, any>, // TYPE THIS
): Promise<void> {
    if (interaction) {
        if (interaction.isCommand()) {
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
        } else if (interaction.isButton()) {
            console.log(
                `[Interaction Handler]: Button interaction received: ${interaction}`,
            );
            for (const command of commands) {
                const buttons = command[1]?.buttons;
                if (!buttons) continue;
                buttons.forEach(async (button: any) => {
                    //THIS NEEDS TYPING
                    if (button.id === interaction.customId) {
                        await button.execute(interaction, client);
                    }
                });
            }
        }
    }
}

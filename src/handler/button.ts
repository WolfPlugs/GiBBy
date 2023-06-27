import { ButtonInteraction, Client } from 'discord.js';

export async function handleButton(
    interaction: ButtonInteraction,
    client: Client,
    commands: Map<string, any>, // TYPE THIS
): Promise<void> {
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

import { SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { readdirSync } from 'fs';
const commandFiles = readdirSync('./src/commands');
export const commandData: SlashCommandOptionsOnlyBuilder[] = [];
export const commands = new Map();

export async function indexCommands() {
    for (const file of commandFiles) {
        const command = await import(
            `../commands/${file}.js`.replace('.ts', '')
        );
        commandData.push(command.data);
        commands.set(command.data.name, command);
    }
}

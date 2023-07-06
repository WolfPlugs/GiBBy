import { commandData } from './indexer.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import credentials from '../../config/credentials.json' assert { type: 'json' };
import settings from '../../config/config.json' assert { type: 'json' };

const restAPI = new REST({ version: '10' }).setToken(credentials.DiscordToken);

export async function pushCommands(): Promise<void> {
    try {
        console.log(`Pushing ${commandData.length} commands...`);
        await restAPI.put(Routes.applicationCommands(settings.ClientId), {
            body: commandData,
        });
    } catch (error) {
        console.error(error);
    }
}

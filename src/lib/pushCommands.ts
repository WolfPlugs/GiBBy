import { commandData } from './indexer.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import credentials from '../../config/credentials.json' assert { type: 'json' };
import settings from '../../config/config.json' assert { type: 'json' };

const restAPI = new REST({ version: '10' }).setToken(credentials.DiscordToken);

export async function pushCommands(): Promise<void> {
    try {
        console.log(
            `Pushing ${commandData.length} commands to guild ${settings.guildID}`,
            await restAPI.put(
                Routes.applicationGuildCommands(
                    settings.clientID,
                    settings.guildID,
                ),
                { body: commandData },
            ),
        );
    } catch (error) {
        console.error(error);
    }
}

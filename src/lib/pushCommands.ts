import { commandData } from './indexer.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import untypedCredentials from '../../config/credentials.json' assert { type: 'json' };
import untypedConfig from '../../config/config.json' assert { type: 'json' };

import { Config, Credentials } from '../types/config.js';

const settings = untypedConfig as Config;
const credentials = untypedCredentials as Credentials;

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

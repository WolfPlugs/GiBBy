import {
    Client,
    GatewayIntentBits,
    Events,
    type ChatInputCommandInteraction,
} from 'discord.js';
import { destroy } from './mongo.js';
import credentials from '../config/credentials.json' assert { type: 'json' };

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, () => {
    console.log('Connected to Discord!');
});

import { indexCommands } from './lib/indexer.js';
await indexCommands();
import { pushCommands } from './lib/pushCommands.js';
await pushCommands();
import { commands } from './lib/indexer.js';
import { handleCommand } from './handler/command.js';
import { handleButton } from './handler/button.js';
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
        await handleCommand(
            interaction as ChatInputCommandInteraction,
            client,
            commands,
        );
    } else if (interaction.isButton()) {
        // L13 - handler/button.ts - This should probably be async, but we will have to see
        handleButton(interaction, client, commands);
    } else if (interaction.isAutocomplete()) {
        console.log('Autocomplete interaction received');
    }
});

client.on(Events.Error, (error) => console.error(error));
client.on(Events.Warn, (warning) => console.warn(warning));
client.on(Events.Invalidated, async () => {
    console.log('Session Invalidated - Stopping Client');
    client.destroy();
    await destroy();
    process.exit(1);
});

await client.login(credentials.DiscordToken);

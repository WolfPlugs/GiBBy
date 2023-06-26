import { Client, GatewayIntentBits, Events } from 'discord.js';
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
import { handleInteraction } from './lib/interactionHandler.js';
import { commands } from './lib/indexer.js';
client.on(Events.InteractionCreate, async (interaction) => {
    await handleInteraction(interaction, client, commands);
});

client.on(Events.Error, (error) => console.error(error));
client.on(Events.Warn, (warning) => console.warn(warning));
client.on(Events.Invalidated, () => {
    console.log('Session Invalidated - Stopping Client');
    client.destroy();
    destroy();
    process.exit(1);
});

await client.login(credentials.DiscordToken);

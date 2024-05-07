import {
    Client,
    GatewayIntentBits,
    Events,
    type ChatInputCommandInteraction,
} from "discord.js";
import { destroy } from "./lib/mongo.js";
import untypedConfig from "../config/config.json" with { type: "json" };
import type { Config } from "./types/config.js";
const { DiscordToken } = untypedConfig as Config;

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, () => {
    console.log("Connected to Discord!");
});

import { indexCommands } from "./lib/indexer.js";
await indexCommands();
import { pushCommands } from "./lib/pushCommands.js";
await pushCommands();
import { commands } from "./lib/indexer.js";
import { handleCommand } from "./handler/command.js";
import { handleButton } from "./handler/button.js";
import { handleAutocomplete } from "./handler/autocomplete.js";

client.on(Events.InteractionCreate, (interaction) => {
    (async ()=> {
        if (interaction.isCommand()) {
            await handleCommand(
                interaction as ChatInputCommandInteraction,
                commands,
            );
        } else if (interaction.isButton()) {
            await handleButton(interaction, commands);
        } else if (interaction.isAutocomplete()) {
            await handleAutocomplete(interaction, commands);
        }
    })
});

client.on(Events.Error, (error) => {console.error(error)});
client.on(Events.Warn, (warning) => {console.warn(warning)});
client.on(Events.Invalidated, () => {
    (async ()=>{
        console.log("Session Invalidated - Stopping Client");
        await client.destroy();
        await destroy();
        process.exit(1);
    });
});

await client.login(DiscordToken);

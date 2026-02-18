import {
	type ChatInputCommandInteraction,
	Client,
	Events,
	GatewayIntentBits,
} from "discord.js";
import { destroy } from "./lib/mongo.js";

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

import { handleAutocomplete } from "./handler/autocomplete.js";
import { handleButton } from "./handler/button.js";
import { handleCommand } from "./handler/command.js";
import { commands } from "./lib/indexer.js";

client.on(Events.InteractionCreate, (interaction) => {
	if (interaction.isCommand()) {
		void handleCommand(interaction as ChatInputCommandInteraction, commands);
	} else if (interaction.isButton()) {
		void handleButton(interaction, commands);
	} else if (interaction.isAutocomplete()) {
		void handleAutocomplete(interaction, commands);
	}
});

client.on(Events.Error, (error) => {
	console.error(error);
});
client.on(Events.Warn, (warning) => {
	console.warn(warning);
});
client.on(Events.Invalidated, () => {
	console.log("Session Invalidated - Stopping Client");
	void destroy().then(async () => {
		await client.destroy();
	});
});

await client.login(process.env.DISCORD_TOKEN);

import { commandData } from "./indexer.js";
import { REST, Routes } from "discord.js";
import untypedConfig from "../../config/config.json" with { type: "json" };

import type { Config } from "../types/config.js";

const { DiscordToken, ClientID } = untypedConfig as Config;

const restAPI = new REST({ version: "10" }).setToken(DiscordToken);

export async function pushCommands(): Promise<void> {
    try {
        console.log(`Pushing ${commandData.length.toString()} commands...`);
        await restAPI.put(Routes.applicationCommands(ClientID), {
            body: commandData,
        });
    } catch (error) {
        console.error(error);
    }
}

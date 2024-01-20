import { commandData } from "./indexer.js";
import { REST, Routes } from "discord.js";
import untypedConfig from "../../config/config.json" assert { type: "json" };

import type { Config } from "../types/config.js";

const { DiscordToken, ClientId } = untypedConfig as Config;

const restAPI = new REST({ version: "10" }).setToken(DiscordToken);

export async function pushCommands(): Promise<void> {
    try {
        console.log(`Pushing ${commandData.length} commands...`);
        await restAPI.put(Routes.applicationCommands(ClientId), {
            body: commandData,
        });
    } catch (error) {
        console.error(error);
    }
}

import { commandData } from "./indexer.js";
import { REST, Routes } from "discord.js";

const restAPI = new REST().setToken(process.env["DISCORD_TOKEN"]!);

export async function pushCommands(): Promise<void> {
	try {
		console.log(`Pushing ${commandData.length.toString()} commands...`);
		await restAPI.put(
			Routes.applicationCommands(process.env["CLIENT_ID"]!),
			{
				body: commandData,
			},
		);
	} catch (error) {
		console.error(error);
	}
}

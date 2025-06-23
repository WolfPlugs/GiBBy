import { readdirSync } from "node:fs";
import type { SlashCommandOptionsOnlyBuilder } from "discord.js";
import type { Command } from "../types/command.d.ts";

const commandFiles = readdirSync("./src/commands");
export const commandData: SlashCommandOptionsOnlyBuilder[] = [];
export const commands = new Map<string, Command>();

export async function indexCommands() {
	for (const file of commandFiles) {
		const command = (await import(
			`../commands/${file}.js`.replace(".ts", "")
		)) as Command;
		commandData.push(command.data);
		commands.set(command.data.name, command);
	}
}

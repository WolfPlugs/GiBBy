import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import {
	badgeExists,
	deleteBadge,
	getBadges,
	setBadgeLimit,
} from "../lib/mongo.js";
import type { Badge } from "../types/badge.js";

export const data = new SlashCommandBuilder()
	.setName("admin")
	.setDescription("Manage a user's badges")
	.addSubcommand((subcommand) =>
		subcommand
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user to delete the badge form")
					.setRequired(true),
			)
			.setName("delete")
			.setDescription("Delete a badge")
			.addStringOption((option) =>
				option
					.setName("name")
					.setDescription("The name of the badge")
					.setRequired(true)
					.setAutocomplete(true),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("badge-limit")
			.setDescription("Set a user's total badge limit")
			.addStringOption((option) =>
				option
					.setName("user-id")
					.setDescription("The user's Discord ID")
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName("slots")
					.setDescription("Total slots (defaults to 15, use 0 to reset)")
					.setMinValue(0),
			),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	if (interaction.inCachedGuild()) {
		if (interaction.member.roles.cache.has(process.env.VERIFIER_ROLE!)) {
			const subcommand = interaction.options.getSubcommand();
			if (subcommand === "badge-limit") {
				const userId = interaction.options.getString("user-id", true).trim();
				if (!/^[1-9][0-9]{16,19}$/.test(userId)) {
					await interaction.reply({
						content: "Enter a valid Discord user ID.",
						flags: MessageFlags.Ephemeral,
					});
					return;
				}

				const slots = interaction.options.getInteger("slots") ?? 15;
				await setBadgeLimit(userId, slots);
				await interaction.reply({
					content:
						slots === 0
							? `Restored the normal badge limit for \`${userId}\`.`
							: `Set the total badge limit for \`${userId}\` to ${slots} slots.`,
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			if (subcommand === "delete") {
				const selectedUser = interaction.options.getUser("user", true);
				const name = interaction.options.getString("name")!;
				if (await badgeExists(selectedUser.id, name, "all")) {
					await deleteBadge(selectedUser.id, name).then(async () => {
						await interaction.reply({
							content: `Deleted badge "${name}" from ${selectedUser.username}`,
							flags: MessageFlags.Ephemeral,
						});
						try {
							return await selectedUser.send({
								content: `Your badge "${name}" has been deleted by an admin.`,
							});
						} catch (e) {
							console.error(e);
							return;
						}
					});
				}
			}
		} else {
			await interaction.reply({
				content: "You are not authorized to use this command",
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}

export async function autocomplete(interaction: AutocompleteInteraction) {
	const options: string[] = [];
	const focus = interaction.options.getFocused();
	(
		await getBadges(interaction.options.get("user")!.value as string, "all")
	).forEach((badge: Badge) => {
		options.push(badge.name);
	});
	const filtered = options.filter((option) => option.startsWith(focus));
	await interaction.respond(
		filtered.map((option) => ({ name: option, value: option })),
	);
}

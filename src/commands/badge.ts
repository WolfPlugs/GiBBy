import {
	ActionRowBuilder,
	type AutocompleteInteraction,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type GuildMember,
	SlashCommandBuilder,
} from "discord.js";
import {
	approveBadge,
	badgeExists,
	blockUser,
	canMakeNewBadge,
	deleteBadge,
	getBadges,
	isBlocked,
	pendBadge,
	unblockUser,
} from "../lib/mongo.js";

import { fireVerification } from "../lib/verification.js";
import type { Badge } from "../types/badge.js";

const blacklistedKeys =
	process.env["BLACKLISTED_WORDS"]!.toLocaleLowerCase().split(",");

export const data = new SlashCommandBuilder()
	.setName("badge")
	.setDescription("Manage your badges")
	.addSubcommand((subcommand) =>
		subcommand
			.setName("create")
			.setDescription("Add a new badge")
			.addStringOption((option) =>
				option
					.setName("name")
					.setDescription("The name of the badge")
					.setRequired(true),
			)
			.addAttachmentOption((option) =>
				option
					.setName("image")
					.setDescription("The image for the badge")
					.setRequired(true),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
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
			.setName("list")
			.setDescription("List a user's badges (defaults to you)")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("Optional user to check badges for")
					.setRequired(false),
			),
	);

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	const id = interaction.user.id;

	//SECTION - NEW BADGE

	if (interaction.options.getSubcommand() === "create") {
		if (await isBlocked(id)) {
			await interaction.reply({
				content:
					"You are blocked from making new badges! Please contact an admin if you believe this is a mistake.",
				ephemeral: true,
			});
			return;
		}
		if (!(await canMakeNewBadge(interaction.member as GuildMember))) {
			await interaction.reply({
				content: `You already have ${(
					Number(process.env["MAX_BADGES"]!) +
						((interaction.member as GuildMember).premiumSince
							? Number(process.env["EXTRA_BOOST_BADGES"]!)
							: 0)
				).toString()} or more badges! (This includes pending badges!)`,
				ephemeral: true,
			});
			return;
		}
		// These WILL exist because they are required by the slash command
		const name = interaction.options.getString("name")!;
		const image = interaction.options.getAttachment("image")!;

		if (blacklistedKeys.some((word) => name.includes(word))) {
			await interaction.reply({
				content: `You can't use that name.`,
				ephemeral: true,
			});
			return;
		}

		if (image.size > Number(process.env["MAX_BADGE_SIZE"])) {
			await interaction.reply({
				content: `The image you have attached is over ${(Number(process.env["MAX_BADGE_SIZE"]) / 1048576).toString()}MB, please try to make it smaller!`,
				ephemeral: true,
			});
			return;
		}
		if (/<:(.*):(.*)>/.test(name)) {
			await interaction.reply({
				content:
					"Custom emojis will not appear in the badge name, and are thus blocked.",
				ephemeral: true,
			});
			return;
		}

		if (await badgeExists(id, name, "all")) {
			await interaction.reply({
				content: "You already have a badge with that name!",
				ephemeral: true,
			});
			return;
		}

		await pendBadge(id, {
			name,
			badge: image.url,
		}).then(async () => {
			await interaction.reply({
				content: "Badge is now pending approval!",
				ephemeral: true,
			});
			await fireVerification(interaction);
		});
		return;
	}

	//SECTION - DELETE BADGE

	if (interaction.options.getSubcommand() === "delete") {
		const name = interaction.options.getString("name")!;
		if (await badgeExists(id, name, "active")) {
			await deleteBadge(id, name).then(async () => {
				await interaction.reply({
					content: "Badge deleted!",
					ephemeral: true,
				});
			});
			return;
		}
		await interaction.reply({
			content: "You do not have an active badge with that name!",
			ephemeral: true,
		});
		return;
	}
	//SECTION - LIST BADGES

	if (interaction.options.getSubcommand() === "list") {
		let user = interaction.user;
		if (interaction.options.getUser("user")) {
			user = interaction.options.getUser("user")!;
		}
		const badges = await getBadges(user.id, "all");
		const returnEmbed = new EmbedBuilder()
			.setTitle(`${user.username}'s Badge Overview`)
			.setDescription(`${user.username} has ${badges.length.toString()} badges`)
			.setColor("#FF0000");

		for (const badge of badges) {
			returnEmbed.addFields({
				name: `${badge.name}${badge.pending ? " `(Pending Approval)`" : ""}`,
				value: badge.badge,
			});
		}

		await interaction.reply({
			embeds: [returnEmbed],
			ephemeral: true,
		});
	}
}

const blockActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
	new ButtonBuilder()
		.setCustomId("verify.block")
		.setStyle(ButtonStyle.Danger)
		.setEmoji("⛔")
		.setLabel("Block User"),
);

const unblockButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
	new ButtonBuilder()
		.setCustomId("verify.unblock")
		.setStyle(ButtonStyle.Danger)
		.setEmoji("🔑")
		.setLabel("Unblock User"),
);

export const buttons = [
	{
		id: "verify.accept",
		execute: async (interaction: ButtonInteraction) => {
			if (interaction.inCachedGuild()) {
				if (interaction.member.roles.cache.has(process.env["VERIFIER_ROLE"]!)) {
					const newEmbed = EmbedBuilder.from(interaction.message.embeds.at(0)!)
						.setFooter({
							text: `Approved by ${interaction.user.username}`,
						})
						.setColor("#00FF00");
					await interaction.update({
						embeds: [newEmbed],
						components: [],
					});
					await approveBadge(
						interaction.message.mentions.users.at(0)!.id,
						interaction.message.embeds.at(0)!.fields[0]!.value,
					);
				} else {
					await interaction.reply({
						content: "You cannot do that!",
						ephemeral: true,
					});
				}
			}
		},
	},
	{
		id: "verify.deny",
		execute: async (interaction: ButtonInteraction) => {
			const originalPrompter = interaction.message.mentions.users.at(0)!;
			if (interaction.inCachedGuild()) {
				if (
					interaction.member.roles.cache.has(process.env["VERIFIER_ROLE"]!) ||
					originalPrompter === interaction.user
				) {
					const newEmbed = EmbedBuilder.from(interaction.message.embeds.at(0)!)
						.setFooter({
							text: `Denied by ${interaction.user.username}`,
						})
						.setColor("#FF0000");
					await interaction.update({
						embeds: [newEmbed],
						components: [blockActionRow],
					});
					await deleteBadge(
						originalPrompter.id,
						interaction.message.embeds.at(0)!.fields[0]!.value,
					);
				} else {
					await interaction.reply({
						content: "You cannot do that!",
						ephemeral: true,
					});
				}
			}
		},
	},
	{
		id: "verify.block",
		execute: async (interaction: ButtonInteraction) => {
			if (interaction.inCachedGuild()) {
				if (interaction.member.roles.cache.has(process.env["VERIFIER_ROLE"]!)) {
					await blockUser(interaction.message.mentions.users.at(0)!.id);
					const newEmbed = EmbedBuilder.from(interaction.message.embeds.at(0)!)
						.setFooter({
							text: `Blocked by ${interaction.user.username}`,
						})
						.setColor("#000000");
					await interaction.update({
						embeds: [newEmbed],
						components: [unblockButtonRow],
					});
				} else {
					await interaction.reply({
						content: "You cannot do that!",
						ephemeral: true,
					});
				}
			}
		},
	},
	{
		id: "verify.unblock",
		execute: async (interaction: ButtonInteraction) => {
			if (interaction.inCachedGuild()) {
				if (interaction.member.roles.cache.has(process.env["VERIFIER_ROLE"]!)) {
					await unblockUser(interaction.message.mentions.users.at(0)!.id);
					const newEmbed = EmbedBuilder.from(interaction.message.embeds.at(0)!)
						.setFooter({
							text: `Unblocked by ${interaction.user.username}`,
						})
						.setColor("#FF0000");
					await interaction.update({
						embeds: [newEmbed],
						components: [blockActionRow],
					});
				} else {
					await interaction.reply({
						content: "You cannot do that!",
						ephemeral: true,
					});
				}
			}
		},
	},
];

export async function autocomplete(interaction: AutocompleteInteraction) {
	const options: string[] = [];
	const focus = interaction.options.getFocused();
	(await getBadges(interaction.user.id, "all")).forEach((badge: Badge) => {
		options.push(badge.name);
	});
	const filtered = options.filter((option) => option.startsWith(focus));
	await interaction.respond(
		filtered.map((option) => ({ name: option, value: option })),
	);
}

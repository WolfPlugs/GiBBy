import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    type AutocompleteInteraction,
} from "discord.js";
import { badgeExists, deleteBadge, getBadges, pendBadge } from "../lib/mongo.js";
import untypedConfig from "../../config/config.json" with { type: "json" };
import type { Config } from "../types/config.js";
const { VerifierRole } = untypedConfig as Config;
import type { Badge } from "../types/badge.js";
import { fireVerification } from "../lib/verification.js";

export const data = new SlashCommandBuilder()
    .setName("admin")
    .setDescription("List all a user's badges")
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
            .setName("force-add")
            .setDescription("Add a badge to the user without the user's permission")
            .addMentionableOption((option)=>
                option
                    .setName("user")
                    .setDescription("User to add badge to")
                    .setRequired(true)
            )
            .addStringOption((option)=>
                option
                    .setName("name")
                    .setDescription("The name of the badge")
                    .setRequired(true)
            )
            .addStringOption((option)=>
                option
                    .setName("url")
                    .setDescription("The image URL of the badge")
                    .setRequired(true)
            )
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.inCachedGuild()) {
        if (interaction.member.roles.cache.has(VerifierRole)) {
            const selectedUser = interaction.options.getUser("user")!; // User will be defined as it is required by command
            if (interaction.options.getSubcommand() === "delete") {
                const name = interaction.options.getString("name")!;
                if (await badgeExists(selectedUser.id, name, "all")) {
                    await deleteBadge(selectedUser.id, name).then(async () => {
                        await interaction.reply({
                            content: `Deleted badge "${name}" from ${selectedUser.username}`,
                            ephemeral: true,
                        });
                        try {
                            return await selectedUser.send({
                                content: `Your badge "${name}" has been deleted by an admin.`,
                            });
                        } catch (e) {
                            return;
                        }
                    });
                }
            } else if (interaction.options.getSubcommand()==="force-add"){
                const name = interaction.options.getString("name")!;
                const user = interaction.options.getUser("user")!;
                const url = interaction.options.getString("url")!
                if (await badgeExists(user.id, name, "all")) {
                    await interaction.reply({
                        content: "User already has a badge with that name",
                        ephemeral: true,
                    });
                    return;
                }
                await pendBadge(user.id, {
                    name,
                    badge: url,
                }).then(async () => {
                    await interaction.reply({
                        content: "Badge is now pending approval!",
                        ephemeral: true,
                    });
                    await fireVerification(interaction);
                });
                return;
            }
        } else {
            await interaction.reply({
                content: "You are not authorized to use this command",
                ephemeral: true,
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

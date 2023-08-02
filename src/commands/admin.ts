import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';
import { badgeExists, deleteBadge } from '../mongo.js';
import untypedConfig from '../../config/config.json' assert { type: 'json' };
import type { Config } from '../types/config.js';
const settings = untypedConfig as Config;

export const data = new SlashCommandBuilder()
    .setName('admin')
    .setDescription("List all a user's badges")
    .addSubcommand((subcommand) =>
        subcommand
            .setName('delete')
            .setDescription('Delete a badge')
            .addStringOption(
                (option) =>
                    option
                        .setName('name')
                        .setDescription('The name of the badge')
                        .setRequired(true),
                //.setAutocomplete(true), // Implement later
            )
            .addStringOption((option) =>
                option
                    .setName('user')
                    .setDescription('The user to delete the badge form')
                    .setRequired(true),
            ),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.inCachedGuild()) {
        if (interaction.member.roles.cache.has(settings.VerifierRole)) {
            const selectedUser = interaction.options.getUser('user')!; // User will be defined as it is required by command

            if (interaction.options.getSubcommand() === 'delete') {
                const name = interaction.options.getString('name')!;
                if (await badgeExists(selectedUser.id, name, 'active')) {
                    await deleteBadge(selectedUser.id, name).then(async () => {
                        await interaction.reply({
                            content: `Deleted badge ${name} from ${selectedUser.username}`,
                            ephemeral: true,
                        });
                        try {
                            return await selectedUser.send({
                                content: `Your badge ${name} has been deleted for breaking the rules`,
                            });
                        } catch (e) {
                            return;
                        }
                    });
                }
            }
        } else {
            await interaction.reply({
                content: 'You are not authorized to use this command',
                ephemeral: true,
            });
        }
    }
}

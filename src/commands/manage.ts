import {
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type ButtonInteraction,
    type AutocompleteInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from 'discord.js';
import {
    canMakeNewBadge,
    pendBadge,
    isBlocked,
    deleteBadge,
    badgeExists,
    getBadges,
    approveBadge,
    blockUser,
} from '../mongo.js';

import untypedConfig from '../../config/config.json' assert { type: 'json' };
import { fireVerification } from '../lib/verification.js';
import { isAllowedDomain } from '../lib/checkDomain.js';
import { Badge } from '../types/badge.js';

import { Config } from '../types/config.js';

const settings = untypedConfig as Config;

export const data = new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Manage your badges')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('create')
            .setDescription('Add a new badge')
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setDescription('The name of the badge')
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName('url')
                    .setDescription('The image URL of the badge')
                    .setRequired(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('delete')
            .setDescription('Delete a badge')
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setDescription('The name of the badge')
                    .setRequired(true)
                    .setAutocomplete(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('url')
            .setDescription("Change a badge's URL")
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setDescription('The name of the badge')
                    .setRequired(true)
                    .setAutocomplete(true),
            )
            .addStringOption((option) =>
                option
                    .setName('url')
                    .setDescription('The new image URL of the badge')
                    .setRequired(true),
            ),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.user.id;

    // NEW BADGE ----------------------------------------------------------------------------------------------

    if (interaction.options.getSubcommand() === 'create') {
        if (await isBlocked(id)) {
            await interaction.reply({
                content:
                    'You are blocked from making new badges! Please contact an admin if you believe this is a mistake.',
                ephemeral: true,
            });
            return;
        }
        if (!(await canMakeNewBadge(interaction.user.id))) {
            await interaction.reply({
                content: `You already have ${settings.MaxBadges} or more badges! (This includes pending badges!)`,
                ephemeral: true,
            });
            return;
        }
        // These WILL exist because they are required by the slash command
        const name = interaction.options.getString('name')!;
        const url = interaction.options.getString('url')!;

        if (!isAllowedDomain(url)) {
            await interaction.reply({
                content: 'This is not a whitelisted domain',
                ephemeral: true,
            });
            return;
        }
        if (await badgeExists(id, name, 'all')) {
            await interaction.reply({
                content: 'You already have a badge with that name!',
                ephemeral: true,
            });
            return;
        }
        await pendBadge(id, {
            name,
            badge: url,
        }).then(async () => {
            await interaction.reply({
                content: 'Badge is now pending approval!',
                ephemeral: true,
            });
            await fireVerification(interaction);
        });
        return;
    }

    // DELETE BADGE --------------------------------------------------------------------------------------------

    if (interaction.options.getSubcommand() === 'delete') {
        const name = interaction.options.getString('name')!;
        if (await badgeExists(id, name, 'active')) {
            await deleteBadge(id, name).then(async () => {
                await interaction.reply({
                    content: 'Badge deleted!',
                    ephemeral: true,
                });
            });
            return;
        }
        await interaction.reply({
            content: 'You do not have an active badge with that name!',
            ephemeral: true,
        });
        return;
    }

    // EDIT BADGE ----------------------------------------------------------------------------------------------

    if (interaction.options.getSubcommand() === 'edit') {
        const name = interaction.options.getString('name')!;
        const url = interaction.options.getString('url')!;
        if (await isBlocked(id)) {
            await interaction.reply({
                content:
                    'You are blocked from editing your badges! Please contact an admin if you believe this is a mistake.',
                ephemeral: true,
            });
            return;
        }
        if (!(await badgeExists(id, name, 'active'))) {
            await interaction.reply({
                content: 'You do not have an active badge with that name!',
                ephemeral: true,
            });
            return;
        }
        await deleteBadge(id, name).then(async () => {
            await pendBadge(id, {
                name,
                badge: url,
            }).then(async () => {
                await interaction.reply({
                    content: 'Badge is now pending approval!',
                    ephemeral: true,
                });
                await fireVerification(interaction);
            });
        });
        return;
    }
}

const blockActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('verify.block')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⛔')
        .setLabel('Block User'),
);

const unblockButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('verify.unblock')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔑')
        .setLabel('Unblock User'),
);

export const buttons = [
    {
        id: 'verify.accept',
        execute: async (interaction: ButtonInteraction) => {
            if (interaction.inCachedGuild()) {
                if (interaction.member.roles.cache.has(settings.VerifierRole)) {
                    await interaction.reply({
                        content: '`verify.accept`',
                        ephemeral: true,
                    });
                    const newEmbed = EmbedBuilder.from(
                        interaction.message.embeds.at(0)!,
                    )
                        .setFooter({
                            text: `Approved by ${interaction.user.username}`,
                        })
                        .setColor('#00FF00');
                    await interaction.message.edit({
                        embeds: [newEmbed],
                        components: [],
                    });
                    await approveBadge(
                        interaction.message.mentions.users.at(0)!.id,
                        interaction.message.embeds.at(0)!.fields[0]!.value,
                    );
                } else {
                    await interaction.reply({
                        content: 'You cannot do that!',
                        ephemeral: true,
                    });
                }
            }
        },
    },
    {
        id: 'verify.deny',
        execute: async (interaction: ButtonInteraction) => {
            const originalPrompter = interaction.message.mentions.users.at(0)!;
            if (interaction.inCachedGuild()) {
                if (
                    interaction.member.roles.cache.has(settings.VerifierRole) ||
                    originalPrompter == interaction.user
                ) {
                    await interaction.reply({
                        content: '`verify.deny`',
                        ephemeral: true,
                    });
                    const newEmbed = EmbedBuilder.from(
                        interaction.message.embeds.at(0)!,
                    )
                        .setFooter({
                            text: `Denied by ${interaction.user.username}`,
                        })
                        .setColor('#FF0000');
                    await interaction.message.edit({
                        embeds: [newEmbed],
                        components: [blockActionRow],
                    });
                    await deleteBadge(
                        originalPrompter.id,
                        interaction.message.embeds.at(0)!.fields[0]!.value,
                    );
                } else {
                    await interaction.reply({
                        content: 'You cannot do that!',
                        ephemeral: true,
                    });
                }
            }
        },
    },
    {
        id: 'verify.block',
        execute: async (interaction: ButtonInteraction) => {
            if (interaction.inCachedGuild()) {
                if (interaction.member.roles.cache.has(settings.VerifierRole)) {
                    await blockUser(
                        interaction.message.mentions.users.at(0)!.id,
                    );
                    const newEmbed = EmbedBuilder.from(
                        interaction.message.embeds.at(0)!,
                    )
                        .setFooter({
                            text: `Blocked by ${interaction.user.username}`,
                        })
                        .setColor('#000000');
                    await interaction.message.edit({
                        embeds: [newEmbed],
                        components: [unblockButtonRow],
                    });
                }
            }
        },
    },
    {
        id: 'verify.unblock',
        execute: async (interaction: ButtonInteraction) => {
            if (interaction.inCachedGuild()) {
                if (interaction.member.roles.cache.has(settings.VerifierRole)) {
                    await blockUser(
                        interaction.message.mentions.users.at(0)!.id,
                    );
                    const newEmbed = EmbedBuilder.from(
                        interaction.message.embeds.at(0)!,
                    )
                        .setFooter({
                            text: `Unblocked by ${interaction.user.username}`,
                        })
                        .setColor('#FF0000');
                    await interaction.message.edit({
                        embeds: [newEmbed],
                        components: [unblockButtonRow],
                    });
                }
            }
        },
    },
];

export async function autocomplete(interaction: AutocompleteInteraction) {
    const options: string[] = [];
    const focus = interaction.options.getFocused();
    (await getBadges(interaction.user.id, 'all')).forEach((badge: Badge) => {
        options.push(badge.name);
    });
    const filtered = options.filter((option) => option.startsWith(focus));
    await interaction.respond(
        filtered.map((option) => ({ name: option, value: option })),
    );
}

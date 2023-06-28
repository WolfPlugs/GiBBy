import { SlashCommandBuilder } from 'discord.js';
import type {
    ChatInputCommandInteraction,
    ButtonInteraction,
} from 'discord.js';
import {
    canMakeNewBadge,
    getBadges,
    getPending,
    pendBadge,
    isBlocked,
    deleteBadge,
    deletePending,
} from '../mongo.js';

import settings from '../../config/config.json' assert { type: 'json' };

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
                    .setRequired(true)
                    .setAutocomplete(true),
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
            .setName('edit')
            .setDescription('Edit a badge')
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setDescription('The name of the badge')
                    .setRequired(true)
                    .setAutocomplete(true),
            )
            .addStringOption((option) =>
                option
                    .setName('new-name')
                    .setDescription('The new name of the badge')
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName('url')
                    .setDescription('The new image URL of the badge')
                    .setRequired(true),
            ),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const badges = await getBadges(interaction.user.id);
    const pending = await getPending(interaction.user.id);

    // NEW BADGE ----------------------------------------------------------------------------------------------

    if (interaction.options.getSubcommand() === 'create') {
        if (await isBlocked(interaction.user.id)) {
            await interaction.reply({
                content:
                    'You are blocked from making new badges! Please contact an admin if you believe this is a mistake.',
                ephemeral: true,
            });
            return;
        }
        if (await canMakeNewBadge(interaction.user.id)) {
            await interaction.reply({
                content: `You already have ${settings.maxBadges} or more badges! (This includes pending badges!)`,
                ephemeral: true,
            });
            return;
        }
        // These WILL exist because they are required by the slash command
        const newName = interaction.options.getString('name');
        const url = interaction.options.getString('url');
        if (badges.find((badge) => badge.name === newName)) {
            await interaction.reply({
                content: 'You already have a badge with that name!',
                ephemeral: true,
            });
            return;
        }
        if (badges.find((badge) => badge.badge === url)) {
            await interaction.reply({
                content: 'You already have a badge with that image URL!',
                ephemeral: true,
            });
            return;
        }
        if (!url || !newName) {
            // Mandatory typescript satisfaction time - These are required by the slash command and should never *NOT* exist, but typescript doesn't know that
            console.log('[This should never happen]: No data');
            await interaction.reply(
                'Something went very wrong. Please contact an admin. Error: ```[This should never happen]: No data```',
            );
            return;
        }
        await pendBadge(interaction.user.id, {
            name: newName,
            badge: url,
        }).then(async () => {
            await interaction.reply({
                content: 'Badge is now pending approval!',
                ephemeral: true,
            });
        });
    }

    // DELETE BADGE --------------------------------------------------------------------------------------------

    if (interaction.options.getSubcommand() === 'delete') {
        const name = interaction.options.getString('name');
        if (badges.find((badge) => badge.name === name)) {
            await deleteBadge(interaction.user.id, name as string).then(
                async () => {
                    await interaction.reply({
                        content: 'Badge deleted!',
                        ephemeral: true,
                    });
                },
            );
        } else if (pending.find((badge) => badge.name === name)) {
            await deletePending(interaction.user.id, name as string).then(
                async () => {
                    await interaction.reply({
                        content: 'Badge deleted!',
                        ephemeral: true,
                    });
                },
            );
        } else {
            await interaction.reply({
                content: 'You do not have a badge with that name!',
                ephemeral: true,
            });
        }
    }

    // EDIT BADGE ----------------------------------------------------------------------------------------------

    // todo: implement lol
}

export const buttons = [
    {
        id: 'manage.delete',
        execute: async function (interaction: ButtonInteraction) {
            await interaction.reply('Button clicked!');
        },
    },
];

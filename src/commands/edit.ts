import {
    CommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ButtonInteraction,
} from 'discord.js';
import { getBadges, getPending } from '../mongo.js';

export const data = new SlashCommandBuilder()
    .setName('edit')
    .setDescription('Edit your badges');

export async function execute(interaction: CommandInteraction) {
    const user = interaction.user;
    const badges = await getBadges(user.id);
    const pending = await getPending(user.id);

    const returnEmbed = new EmbedBuilder()

        .setTitle(`${user.username}'s Badges`)
        .setDescription(
            `${user.username} has ${badges.length} active badges, and ${
                pending.length
            } pending badges, for a total of ${
                badges.length + pending.length
            }/5 badges`,
        );

    const selector = new StringSelectMenuBuilder()
        .setCustomId('edit.select')
        .setPlaceholder('Select Badge');

    for (const badge of badges) {
        returnEmbed.addFields({
            name: badge.name,
            value: badge.badge,
        });
        selector.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(badge.name)
                .setValue(badge.name),
        );
    }
    for (const badge of pending) {
        returnEmbed.addFields({
            name: `${badge.name} - (Pending Approval)`,
            value: badge.badge,
        });
        // Implement later once I have a better idea of how to handle modifying pending badges
        // selector.addOptions(
        //     new StringSelectMenuOptionBuilder()
        //         .setLabel(`${badge.name} - (Pending Approval)`)
        //         .setValue(badge.name),
        // );
    }

    const newButton = new ButtonBuilder()
        .setCustomId('edit.new')
        .setLabel('New Badge')
        .setStyle(ButtonStyle.Success)
        .setDisabled(false);

    const renameButton = new ButtonBuilder()
        .setCustomId('edit.rename')
        .setLabel('Rename Badge')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const urlButton = new ButtonBuilder()
        .setCustomId('edit.url')
        .setLabel('Update URL')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const deleteButton = new ButtonBuilder()
        .setCustomId('edit.delete')
        .setLabel('Delete Badge')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

    const previewButton = new ButtonBuilder()
        .setCustomId('edit.preview')
        .setLabel('Preview')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        // NEW, RENAME, URL, need to be updated to slash commands to take input
        newButton,
        renameButton,
        urlButton,
        deleteButton,
        previewButton,
    );

    const selectorRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector);

    await interaction.reply({
        embeds: [returnEmbed],
        components: [selectorRow, buttonRow],
        ephemeral: true,
    });
}

export const buttons = [
    {
        id: 'edit.new',
        execute: async function (interaction: ButtonInteraction) {
            console.log('Button!!!');
        },
    },
];

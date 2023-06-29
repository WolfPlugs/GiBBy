import {
    type ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { getBadges, getPending } from '../mongo.js';
export const data = new SlashCommandBuilder()
    .setName('list')
    .setDescription("List all a user's badges")
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user to list badges for')
            .setRequired(false),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    const badges = await getBadges(user.id);
    const pending = await getPending(user.id);
    const returnEmbed = new EmbedBuilder()
        .setTitle(`${user.username}'s Badges`)
        .setDescription(`${user.username} has ${badges.length} badges`)
        .setColor('#FF0000');
    for (const badge of badges) {
        returnEmbed.addFields({
            name: badge.name,
            value: badge.badge,
        });
    }
    for (const badge of pending) {
        returnEmbed.addFields({
            name: `${badge.name} (Pending)`,
            value: badge.badge,
        });
    }
    await interaction.reply({ embeds: [returnEmbed], ephemeral: true });
}

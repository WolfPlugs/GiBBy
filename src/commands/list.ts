import {
    type ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { getBadges } from '../mongo.js';
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
    let user = interaction.user;
    if (interaction.options.getUser('user')) {
        user = interaction.options.getUser('user')!;
    }
    const badges = await getBadges(user.id, 'all');
    const returnEmbed = new EmbedBuilder()
        .setTitle(`${user.username}'s Badges`)
        .setDescription(`${user.username} has ${badges.length} badges`)
        .setColor('#FF0000');
    for (const badge of badges) {
        returnEmbed.addFields({
            name: `${badge.name}${
                badge.pending ? ' `(Pending Approval)`' : ''
            }`,
            value: badge.badge,
        });
    }
    await interaction.reply({ embeds: [returnEmbed], ephemeral: true });
}

import settings from '../../config/config.json' assert { type: 'json' };
import {
    EmbedBuilder,
    ChatInputCommandInteraction,
    TextChannel,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from 'discord.js';

export async function fireVerification(data: ChatInputCommandInteraction) {
    const user = data.user;
    const badgeURL = data.options.getString('url')!;
    const badgeName = data.options.getString('name')!;

    const acceptButton = new ButtonBuilder()
        .setCustomId('verify.accept')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅');

    const denyButton = new ButtonBuilder()
        .setCustomId('verify.deny')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('✖️');

    const embed = new EmbedBuilder()
        .setAuthor({
            name: user.username,
            iconURL: user.displayAvatarURL(),
        })
        .setImage(badgeURL)
        .addFields({
            name: 'Badge Name',
            value: `**${badgeName}**`,
        })
        .addFields({
            name: 'URL:',
            value: badgeURL,
        })
        .setTimestamp(Date.now())
        .setColor('#FFA500');
    if (data.options.getSubcommand() === 'create') {
        embed.setTitle(`${user.username}'s Badge Request:`);
        acceptButton.setLabel('Approve Badge Creation');
        denyButton.setLabel('Deny Badge Creation');
    } else {
        embed.setTitle(`${user.username}'s Badge Change:`);
        acceptButton.setLabel('Approve Badge URL Change');
        denyButton.setLabel('Deny Badge URL Change');
    }

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        acceptButton,
        denyButton,
    );

    await (
        data.client.channels.cache.get(settings.promptChannel) as TextChannel
    ).send({ embeds: [embed], components: [buttons] });
}

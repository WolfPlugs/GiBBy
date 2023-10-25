import untypedSettings from '../../config/config.json' assert { type: 'json' };
import { deleteBadge, getBadge } from '../mongo.js';
import { Config } from '../types/config.js';

const settings = untypedSettings as Config;
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
    const badgeName = data.options.getString('name')!;
    const badge = await getBadge(user.id, badgeName);
    if (
        badge === undefined ||
        badge.imageHash === null ||
        badge.badge === null
    ) {
        deleteBadge(user.id, badgeName);
        await data.channel?.send({
            content: `Critical Error: Badge components are undefined!\n\`\`\`${JSON.stringify(
                badge,
            )}\`\`\`\nBadge has been deleted.\nPlease contact an admin!`,
        });
        return;
    }
    const badgeImgurLink = badge.badge;

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
        .setImage(data.options.getString('url'))
        .addFields({
            name: 'Badge Name',
            value: badgeName,
        })
        .addFields({
            name: 'URL:',
            value: badgeImgurLink,
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
        data.client.channels.cache.get(settings.PromptChannel) as TextChannel
    ).send({
        content: `<@${user.id}>`,
        embeds: [embed],
        components: [buttons],
    });
}

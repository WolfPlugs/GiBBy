import untypedSettings from '../../config/config.json' assert { type: 'json' };
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
    const badgeData = data.options.getAttachment('image')!;

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
        .setImage(data.options.getAttachment('image')!.url)
        .addFields({
            name: 'Badge Name',
            value: badgeName,
        })
        .addFields({
            name: 'URL:',
            // Only to test how it would look clean on embed
            value: badgeData.url.replace(/\.(png|gif|jpeg|jpg|bmp|webp|tiff|svg|ico).*$/, '.$1'),
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

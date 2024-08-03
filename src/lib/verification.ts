import {
	EmbedBuilder,
	ChatInputCommandInteraction,
	TextChannel,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from "discord.js";

export async function fireVerification(data: ChatInputCommandInteraction) {
	const user = data.user;
	const badgeName = data.options.getString("name")!;
	const badgeImage = data.options.getAttachment("image")!;

	const acceptButton = new ButtonBuilder()
		.setCustomId("verify.accept")
		.setStyle(ButtonStyle.Success)
		.setEmoji("✅");

	const denyButton = new ButtonBuilder()
		.setCustomId("verify.deny")
		.setStyle(ButtonStyle.Danger)
		.setEmoji("✖️");

	const embed = new EmbedBuilder()
		.setAuthor({
			name: user.username,
			iconURL: user.displayAvatarURL(),
		})
		.setImage(badgeImage.url)
		.addFields({
			name: "Badge Name",
			value: badgeName,
		})
		.addFields({
			name: "URL:",
			value: badgeImage.url,
		})
		.setTimestamp(Date.now())
		.setColor("#FFA500");
	if (data.options.getSubcommand() === "create") {
		embed.setTitle(`${user.username}'s Badge Request:`);
		acceptButton.setLabel("Approve Badge Creation");
		denyButton.setLabel("Deny Badge Creation");
	} else {
		embed.setTitle(`${user.username}'s Badge Change:`);
		acceptButton.setLabel("Approve Badge URL Change");
		denyButton.setLabel("Deny Badge URL Change");
	}

	const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
		acceptButton,
		denyButton,
	);

	await (
		data.client.channels.cache.get(
			process.env["PROMPT_CHANNEL"]!,
		) as TextChannel
	).send({
		content: `<@${user.id}>`,
		embeds: [embed],
		components: [buttons],
	});
}

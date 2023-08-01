import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { badgeExists, deleteBadge } from "../mongo.js";

export const data = new SlashCommandBuilder()
  .setName("admin")
  .setDescription("List all a user's badges")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("delete")
      .setDescription("Delete a badge")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of the badge")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option
          .setName("user")
          .setDescription("The user trying to delete the badge from")
          .setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  let user = interaction.user;

  if (!interaction.options.getUser("user"))
    return await interaction.reply({
      content: "Please mention a user",
      ephemeral: true,
    });
  user = interaction.options.getUser("user")!;

  if (interaction.options.getSubcommand() === "delete") {
    const name = interaction.options.getString("name")!;
    if (await badgeExists(user.id, name, "active")) {
      await deleteBadge(user.id, name).then(async () => {
        await interaction.reply({
          content: `Deleted badge ${name} from ${user.username}`,
          ephemeral: true,
        });
        try {
          await user.send({
            content: `Your badge ${name} has been deleted for breaking the rules`,
          });
        } catch (e) {
          return;
        }
      });
    }
  }
}

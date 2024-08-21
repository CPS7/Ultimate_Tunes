const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { cooldown } = require("../../commands/Music/skip");
const Player = require("../../models/player");

module.exports = {
    name: "disconnect",
    description: "disconnects form vc",
    cooldown:3000,
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        const playeropt = await Player.findOne({ guildId: interaction.guildId });
        const player = interaction.client.manager.players.get(interaction.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("I am not connected to any Voice Channel.")
            return interaction.reply({embeds: [embed]});
        }

        if (player.playing) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("I can not disconnect cause a song is playing.")
            return interaction.reply({embeds: [embed]});
        }

        if (!playeropt) {
            player.stop()
            player.destroy()
            const embede = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Left The Voice Channel.")
            return interaction.reply({embeds: [embede]});
        } else {
            const embede = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("24/7 Mode is on.")
            return interaction.reply({embeds: [embede]});
        }
    }
}
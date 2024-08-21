const { EmbedBuilder } = require("discord.js");
const Player = require("../../models/player")

const voteCollectors = new Map();

module.exports = {
    name: 'disconnect',
    description: "Disconnect's Bot",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    aliases: ["dc", "d"],
    run: async (client, message, args) => {
        const playeropt = await Player.findOne({ guildId: message.guild.id });
        const player = client.manager.players.get(message.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("I am not connected to any Voice Channel.")
            return message.reply({embeds: [embed]});
        }

        if (player.playing) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("I can not disconnect cause a song is playing.")
            return message.reply({embeds: [embed]});
        }

        if (!playeropt) {
            player.stop();
            player.destroy();
            const embede = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("Left the Voice Channel.")
            return message.reply({embeds: [embede]});
        } else {
            const embede = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("24/7 mode is on.")
            return message.reply({embeds: [embede]});
        }
    }
};
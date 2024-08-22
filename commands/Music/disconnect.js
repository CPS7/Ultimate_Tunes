const { EmbedBuilder } = require("discord.js");
const Player = require("../../models/player");
const { category } = require("../info/help");

const voteCollectors = new Map();

module.exports = {
    name: 'disconnect',
    description: "Disconnect's Bot",
    category: "music",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    aliases: ["dc", "d"],
    player: true,
    playing: true,
    sameVoiceChannel: true,
    usage: "<prefix>disconnect",
    run: async (client, message, args) => {
        const playeropt = await Player.findOne({ guildId: message.guild.id });
        const player = client.manager.players.get(message.guild.id);

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
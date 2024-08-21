const { EmbedBuilder } = require("discord.js");
const Player = require("../../models/player");

module.exports = {
    name: "loop",
    description: "Put the current song on loop",
    cooldown: 3000,
    usage: '<prefix>loop <enable|disable>',
    run: async (client, message, args) => {
        const mode = args[0];

        if (!mode || (mode !== 'enable' && mode !== 'disable')) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Please provide a valid mode: `enable` or `disable`.");
            return message.reply({ embeds: [embed] });
        }

        const player = client.manager.players.get(message.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("I am not connected to any Voice Channel.");
            return message.reply({ embeds: [embed] });
        }

        if (!player.playing) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("No song is playing right now.");
            return message.reply({ embeds: [embed] });
        }

        if (mode === 'enable') {
            player.trackRepeat = true
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Song is now on loop.");
            return message.reply({ embeds: [embed] });
        }

        if (mode === 'disable') {
            player.trackRepeat(false); // Corrected from `true` to `false` for disabling loop
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Song is now not on loop.");
            return message.reply({ embeds: [embed] });
        }
    }
}

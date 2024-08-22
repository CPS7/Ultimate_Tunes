const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'volume',
    description: "Controls the volume of the bot",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    aliases: ["v", "vl", "vol"],
    playing: true,
    player: true,
    sameVoiceChannel:false,
    category: "music",
    usage: "<prefix>vol <100>",
    run: async (client, message, args) => {
        // Check if the user is in a voice channel
        if (!message.member.voice.channel) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('You must be in a voice channel to use this command.');
            return message.reply({ embeds: [embed] });
        }

        // Check if the bot is in the same voice channel
        const botVoiceChannel = message.guild.members.me.voice.channel;
        if (botVoiceChannel && message.member.voice.channelId !== botVoiceChannel.id) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`You must be in the same voice channel as the bot to use this command. The bot is currently in <#${botVoiceChannel.id}>.`);
            return message.reply({ embeds: [embed] });
        }

        // Retrieve the player
        const player = client.manager.players.get(message.guild.id);
        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('There is no music currently playing.');
            return message.reply({ embeds: [embed] });
        }

        // Parse the volume input
        const volume = parseInt(args[0], 10);
        if (isNaN(volume) || volume < 0 || volume > 100) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Please provide a valid volume level between 0 and 100.');
            return message.reply({ embeds: [embed] });
        }

        // Set the volume
        player.setVolume(volume);
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`Volume has been set to ${volume}%`);
        return message.reply({ embeds: [embed] });
    }
};

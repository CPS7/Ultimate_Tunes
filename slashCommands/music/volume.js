const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "volume",
    description: "Controls the volume of the bot",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'level',
            description: 'Volume level to set (0-100)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
    cooldown: 3000,
    run: async (client, interaction) => {
        const { guild, member, options } = interaction;

        if (!guild || !guild.id) return;

        if (!interaction.replied || interaction.deferred) {
            await interaction.deferReply();
        }

        // Check if the user is in a voice channel
        if (!member.voice.channel) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('You must be in a voice channel to use this command.');
            return interaction.editReply({ embeds: [embed] });
        }

        // Check if the bot is in the same voice channel
        const botVoiceChannel = guild.members.me.voice.channel;
        if (botVoiceChannel && member.voice.channelId !== botVoiceChannel.id) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`You must be in the same voice channel as the bot to use this command. The bot is currently in <#${botVoiceChannel.id}>.`);
            return interaction.editReply({ embeds: [embed] });
        }

        // Retrieve the player
        const player = client.manager.players.get(guild.id);
        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('There is no music currently playing.');
            return interaction.editReply({ embeds: [embed] });
        }

        // Get the volume level from the interaction options
        const volume = options.getInteger('level');

        if (volume < 0 || volume > 100) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Please provide a valid volume level between 0 and 100.');
            return interaction.editReply({ embeds: [embed] });
        }

        // Set the volume
        player.setVolume(volume);
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`Volume has been set to ${volume}%`);
        return interaction.editReply({ embeds: [embed] });
    }
};

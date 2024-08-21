const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: 'volumeUp_button',
    permissions: [],
    cooldown: 3000,
    run: async (client, interaction) => {
        const { guild, member } = interaction;

        if (!guild || !guild.id) return;

        // Check if the user is in a voice channel
        if (!member.voice.channel) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('You must be in a voice channel to use this command.');
            return interaction.reply({ embeds: [embed] });
        }

        // Check if the bot is in the same voice channel
        const botVoiceChannel = guild.members.me.voice.channel;
        if (botVoiceChannel && member.voice.channelId !== botVoiceChannel.id) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`You must be in the same voice channel as the bot to use this command. The bot is currently in <#${botVoiceChannel.id}>.`);
            return interaction.reply({ embeds: [embed] });
        }

        // Retrieve the player
        const player = client.manager.players.get(guild.id);
        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('There is no music currently playing.');
            return interaction.reply({ embeds: [embed] });
        }

        // Get the current volume
        const currentVolume = player.volume;
        const newVolume = Math.min(currentVolume + 10, 100); // Increase volume by 10%, max 100%

        // Set the new volume
        player.setVolume(newVolume);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`Volume increased to ${newVolume}%`);
        await interaction.reply({ embeds: [embed] });

        // Ensure deletion of the interaction reply
        setTimeout(async () => {
            await interaction.deleteReply();
            console.log('Interaction reply deleted successfully.');
        }, 5000);
    }
};

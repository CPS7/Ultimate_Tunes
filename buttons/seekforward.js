const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: 'seekForward_button',
    permissions: [],
    cooldown: 3000,
    run: async (client, interaction) => {
        const member = interaction.member;

        if (!member.voice.channel) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("You must be in a voice channel to use this command.");
            return interaction.reply({ embeds: [embed] });
        }

        const botCurrentVoiceChannelId = interaction.guild.members.me?.voice.channelId;;

        if (
            botCurrentVoiceChannelId &&
            member.voice.channelId &&
            member.voice.channelId !== botCurrentVoiceChannelId
        ) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`You must be connected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`);
            return await interaction.reply({
                embeds: [embed]
            });
        }

        const player = client.manager.players.get(interaction.guildId);

        if (!player || !player.queue.current) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("There is no song currently playing.");
            return await interaction.reply({
                embeds: [embed]
            });
        }

        const seekTime = 10;

        player.seek(seekTime * 1000); // Seek to the provided time in milliseconds

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setDescription(`Seeked to ${seekTime} seconds.`);
        await interaction.reply({
            embeds: [embed]
        });
    }
}

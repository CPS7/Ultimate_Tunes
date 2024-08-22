const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "seek",
    description: "Seeks to a specific position in the current track.",
    category: 'music',
    player: true,
    playing: true,
    sameVoiceChannel: true,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "timestamp",
            description: "The time to seek to in the format MM:SS (minutes:seconds).",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (client, interaction) => {
        const player = interaction.client.manager.players.get(interaction.guild.id);
        const timeInput = interaction.options.getString("timestamp");

        if (!player.queue.current) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("There is no song currently playing.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!timeInput || !/^(\d{1,2}):(\d{2})$/.test(timeInput)) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Invalid time format. Please provide a time in the format `MM:SS`.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const [minutes, seconds] = timeInput.split(':').map(Number);
        const seekTime = minutes * 60 + seconds;

        if (isNaN(seekTime) || seekTime < 0 || seekTime > player.queue.current.duration / 1000) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Invalid seek time. Please provide a valid time within the duration of the current track.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        player.seek(seekTime * 1000);

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setDescription(`Seeked to \`${minutes}:${seconds < 10 ? '0' + seconds : seconds}\` in the current track.`);
        return interaction.reply({ embeds: [embed] });
    }
};

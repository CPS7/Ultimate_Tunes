const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "seek",
    description: "Seeks to a specific position in the current track.",
    cooldown: 3000, // Cooldown time in milliseconds
    run: async (client, message, args) => {
        const player = message.client.manager.players.get(message.guild.id);
        const timeInput = args[0];

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("I am not connected to any Voice Channel.");
            return message.channel.send({ embeds: [embed] });
        }

        if (!player.queue.current) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("There is no song currently playing.");
            return message.channel.send({ embeds: [embed] });
        }

        if (!timeInput || !/^(\d{1,2}):(\d{2})$/.test(timeInput)) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Invalid time format. Please provide a time in the format `MM:SS`.");
            return message.channel.send({ embeds: [embed] });
        }

        const [minutes, seconds] = timeInput.split(':').map(Number);
        const seekTime = minutes * 60 + seconds;

        if (isNaN(seekTime) || seekTime < 0 || seekTime > player.queue.current.duration / 1000) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Invalid seek time. Please provide a valid time within the duration of the current track.");
            return message.channel.send({ embeds: [embed] });
        }

        player.seek(seekTime * 1000);

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setDescription(`Seeked to \`${minutes} minutes and ${seconds} seconds\` in the current track.`);
        return message.channel.send({ embeds: [embed] });
    }
};

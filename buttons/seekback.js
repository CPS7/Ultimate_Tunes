const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: 'seekBack_button',
    permissions: [],
    cooldown: 3000,
    run: async (client, interaction) => {
        const player = interaction.client.manager.players.get(interaction.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("I am not connected to any Voice Channel.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!player.queue.current) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("There is no song currently playing.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const currentPosition = player.position; // Current position in milliseconds
        const newSeekPosition = currentPosition - 10000; // Move forward 10 seconds (10,000 milliseconds)

        if (newSeekPosition > player.queue.current.duration) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Cannot seek beyond the track's duration.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        player.seek(-10);

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setDescription(`Seeked back 10 seconds.`);
        return interaction.reply({ embeds: [embed] });
    }
}
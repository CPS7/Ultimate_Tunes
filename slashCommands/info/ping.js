const { ApplicationCommandType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: "Check bot's ping.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async(client, interaction) => {
        await interaction.deferReply();
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle("Ping")
            .setDescription(`Latency: ${interaction.client.ws.ping}`);
        await interaction.editReply({ embeds: [embed] });
    }
};
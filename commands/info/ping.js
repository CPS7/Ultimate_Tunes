const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: "Check bot's ping.",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    run: async(client, message, args) => {

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle("Ping")
            .setDescription(`Latency: ${client.ws.ping}`);

        await message.reply({ embeds: [embed] });
    }
};
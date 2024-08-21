const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'uptime',
    description: "Check the bot's latest uptime",
    cooldown: 3000,
    run: async(client, message, args) => {
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 3600) % 24;
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        const embed = new EmbedBuilder()
            .setTitle("Ultimate Tune's Uptime")
            .setDescription(`**Uptime**: ${days} Day(s), ${hours} Hour(s), ${minutes} Minute(s), ${seconds} Second(s)`)
            .setColor("#000000")
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        try {
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Failed to send uptime:', error);
            return message.reply('Failed to send uptime information.');
        }
    },
};
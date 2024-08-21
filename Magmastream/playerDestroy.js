const { EmbedBuilder } = require("discord.js");
const Guild = require("../models/guilds");

module.exports = async (client, player) => {
    const guildId = player.guild;
    if (!guildId) {
        console.error('Guild ID is undefined. Check the player object:', player);
        return;
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error(`Guild not found for ID: ${guildId}`);
        return;
    }

    const guildSettings = await Guild.findOne({ guildId: guild.id });
    if (!guildSettings || !guildSettings.embedMessageId) return;

    const setupChannel = guild.channels.cache.get(guildSettings.setupChannelId);
    if (!setupChannel) return;

    const setupMessage = await setupChannel.messages.fetch(guildSettings.embedMessageId);
    if (setupMessage) {
        const responseEmbed = new EmbedBuilder()
            .setColor('#0000FF')
            .setDescription(`Setup channel created: <#${setupChannel.id}>`);
        await setupMessage.edit({ embeds: [responseEmbed] });
    }

    const m = await player.nowPlayingMessage?.fetch().catch(() => {});
    if (m && m.deletable) {
        await m.delete().catch(() => {});
    }

    console.log(`Player destroyed`);
};

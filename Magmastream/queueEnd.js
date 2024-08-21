const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player")

module.exports = async (client, player) => {
    console.log("Queue Ended");
    const playeropt = await Player.findOne({ guildId: player.guild.id });

    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) {
        console.log("No channel found to send queue end message");
        return;
    }

    // If there is a "Now Playing" message, update it
    if (player.nowPlayingMessageId) {
        try {
            const nowPlayingMessage = await channel.messages.fetch(player.nowPlayingMessageId);
            if (nowPlayingMessage) {
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle('Thanks for playing!')
                    .setDescription('The queue has ended. Use Play command to play more songs😘');

                await nowPlayingMessage.edit({ embeds: [embed] });
            }
        } catch (error) {
            console.log("Error fetching or editing the now playing message: ", error);
        }
    } else {
        // If there is no "Now Playing" message, send a new one
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle('Thanks for playing!')
            .setDescription('The queue has ended. Use Play command to play more songs😘');

        await channel.send({ embeds: [embed] });

        
    }

    const m = await player.nowPlayingMessage?.fetch().catch(() => {});
    if (m && m.deletable) {
        await m.delete().catch(() => {});
    }

    // Optionally, destroy the player and disconnect
    if (player) {
        if (!playeropt) {
            player.disconnect();
        }
    }
};

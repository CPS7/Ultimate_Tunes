const { EmbedBuilder, Embed } = require("discord.js");
module.exports = async (client, player, track, payload) => {
    if (!player.textChannel) {
        console.log(" no message to send")
    }
    const channel = client.channels.cache.get(
        player.textChannel)

    if (!channel) {
            return console.log("No channel found to send track start");
        }

    const embed = new EmbedBuilder()
        .setColor("#0001D1")
        .setDescription(`Error Playing ${String(track.title)}`)
        .setImage(track.thumbnail)
        

    const message = await channel.send({embeds: [embed]});
        
    player.setNowPlayingMessage(message);

    const m = await player.nowPlayingMessage?.fetch().catch(() => {});
    if (m && m.deletable) {
        await m.delete().catch(() => {});
    }
}
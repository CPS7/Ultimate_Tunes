const { EmbedBuilder } = require("discord.js");
const Guild = require("../models/guilds");

module.exports = async (client, player) => {
    console.log("Track Ended");
    const m = await player.nowPlayingMessage?.fetch().catch(() => {});
    if (m && m.deletable) {
        await m.delete().catch(() => {});
    }
};

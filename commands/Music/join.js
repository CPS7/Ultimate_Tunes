const { EmbedBuilder } = require("discord.js");
const { sameVoiceChannel } = require("./play");

module.exports = {
    name: 'join',
    description: "Bot Join Bot",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    aliases: ["j","jn"],
    sameVoiceChannel: true,
    category: "music",
    usage: "<prefix>join",
    run: async (client, message, args) => {

        if (!message.member.voice.channel) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`You must be in a voice channel to use this command.`);
            return message.reply({embeds: [embed]});
        }

        const botCurrentVoiceChannelId = message.client.user.voiceChannel

        if (
            botCurrentVoiceChannelId &&
            member.voice.channelId &&
            member.voice.channelId !== botCurrentVoiceChannelId
        ) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`You must be connnected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`);
            return await message.reply({
                embeds: [embed]
            });
        }

        const player = client.manager.create({
            guild: message.guildId,
            textChannel: message.channelId,
            voiceChannel: message.member.voice.channelId,
            selfDeafen: true,
            volume: 100,
        });
        if (player.state == "CONNECTED") {
            const embedee = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Already in your VC use Play command to play songs.")
        return await message.reply({
            embeds: [embedee]
        });
    }

        if (player.state !== "CONNECTED") player.connect();
        const embede = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Joined your VC use Play command to play songs.")
        return await message.reply({
            embeds: [embede]
        });
    }
}
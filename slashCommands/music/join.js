const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { cooldown } = require("./disconnect");
module.exports = {
    name: "join",
    description: "Join's vc",
    type: ApplicationCommandType.ChatInput,
    category: 'music',
    player: false,
    playing: false,
    sameVoiceChannel: true,
    cooldown: 3000,
    run: async (client, interaction) => {

        if (!interaction.guild || !interaction.guildId) return;
        if (!interaction.replied || interaction.deferred) {
            await interaction.deferReply({
                ephemeral: false,
            });
        }

        const member = interaction.guild.members.cache.get(interaction.user.id);

        if (!member) return;

        if (!member.voice.channelId) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`You must be in a voice channel to use this command.`);
            return await interaction.editReply({
                embeds: [embed]
            });
        }

        const botCurrentVoiceChannelId =
            interaction.guild.members.me?.voice.channelId;

        if (
            botCurrentVoiceChannelId &&
            member.voice.channelId &&
            member.voice.channelId !== botCurrentVoiceChannelId
        ) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`You must be connnected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`);
            return await interaction.editReply({
                embeds: [embed]
            });
        }

        const player = client.manager.create({
            guild: interaction.guildId,
            textChannel: interaction.channelId,
            voiceChannel: member.voice.channelId,
            selfDeafen: true,
            volume: 100,
        });

        if (player.state == "CONNECTED"){
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Already in your VC use Play command to play songs.")
            await interaction.editReply({
                embeds: [embed]
        });
            return
    }

        if (player.state !== "CONNECTED") player.connect();
        const embede = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Joined your VC use Play command to play songs..")
        return await interaction.editReply({
            embeds: [embede]
        });
    }
}
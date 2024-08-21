const { EmbedBuilder } = require('discord.js');
const Player = require("../../models/player");

module.exports = {
    name: '24/7',
    description: "Toggles 24/7 mode",
    cooldown: 3000,
    usage: '<prefix>247 <enable|disable>',
    run: async (client, message, args) => {
        const mode = args[0];

        if (!mode || (mode !== 'enable' && mode !== 'disable')) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Please provide a valid mode: `enable` or `disable`.");
            return message.reply({ embeds: [embed] });
        }

        const member = message.member;
        const botCurrentVoiceChannelId = message.guild.members.me.voice.channelId;

        if (
            botCurrentVoiceChannelId &&
            member.voice.channelId &&
            member.voice.channelId !== botCurrentVoiceChannelId
        ) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`You must be connected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`);
            return await message.reply({
                embeds: [embed]
            });
        }

        if (!member.voice.channel) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`You must be in a voice channel to use this command.`);
            return message.reply({ embeds: [embed] });
        }

        if (!member.permissions.has('MANAGE_GUILD')) {
            return message.reply('You need the Manage Server permission to use this command.');
        }

        const player = client.manager.players.get(message.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("I am not connected to any Voice Channel.");
            return message.reply({ embeds: [embed] });
        }

        let guildsettings = await Player.findOne({ guildId: player.guild });

        if (mode === 'enable') {
            if (guildsettings && guildsettings.voiceChannelId === player.voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("Player is already 24/7.");
                return await message.reply({ embeds: [embed] });
            }

            if (!guildsettings) {
                guildsettings = new Player({
                    guildId: player.guild,
                    voiceChannelId: player.voiceChannel,
                    textChannelId: player.textChannel,
                });
            } else {
                guildsettings.voiceChannelId = player.voiceChannel;
                guildsettings.textChannelId = player.textChannel;
            }

            await guildsettings.save();

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("Player is now 24/7.");
            await message.reply({ embeds: [embed] });
        } else if (mode === 'disable') {
            if (guildsettings && guildsettings.voiceChannelId !== null) {
                guildsettings.voiceChannelId = null;
                guildsettings.textChannelId = null;
                await guildsettings.save();

                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("24/7 mode is now disabled.");
                await message.reply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("24/7 mode is not enabled.");
                await message.reply({ embeds: [embed] });
            }
        }
    },
};

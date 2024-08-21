const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Player = require("../../models/player");

module.exports = {
    name: '247',
    description: "Toggles 24/7 mode",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'mode',
            description: 'Enable or disable 24/7 mode',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Enable',
                    value: 'enable'
                },
                {
                    name: 'Disable',
                    value: 'disable'
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        const mode = interaction.options.getString('mode');
        const member = interaction.member;
        const botCurrentVoiceChannelId = interaction.guild.members.me.voice.channelId;

        if (
            botCurrentVoiceChannelId &&
            member.voice.channelId &&
            member.voice.channelId !== botCurrentVoiceChannelId
        ) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`You must be connected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`);
            return await interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }

        if (!member.voice.channel) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`You must be in a voice channel to use this command.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member.permissions.has('MANAGE_GUILD')) {
            return interaction.reply('You need the Manage Server permission to use this command.');
        }

        const player = interaction.client.manager.players.get(interaction.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription("I am not connected to any Voice Channel.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let guildsettings = await Player.findOne({ guildId: player.guild });

        if (mode === 'enable') {
            if (guildsettings && guildsettings.voiceChannelId === player.voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("Player is already 24/7.");
                return await interaction.reply({ embeds: [embed], ephemeral: true });
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
            await interaction.reply({ embeds: [embed] });
        } else if (mode === 'disable') {
            if (guildsettings && guildsettings.voiceChannelId !== null) {
                guildsettings.voiceChannelId = null;
                guildsettings.textChannelId = null;
                await guildsettings.save();

                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("24/7 mode is now disabled.");
                await interaction.reply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("24/7 mode is not enabled.");
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};

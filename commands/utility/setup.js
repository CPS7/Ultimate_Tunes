const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../../models/guilds');
const Embed = require('../../models/Embed');

module.exports = {
    name: 'setup',
    description: "Creates or deletes setup channel",
    cooldown: 3000,
    usage: '<prefix>setup <create|delete>',
    aliases: ["set"],
    userPerms: [PermissionsBitField.Flags.ManageChannels],
    run: async (client, message, args) => {
        const guildId = message.guild.id;

        try {
            const guildSettings = await Guild.findOne({ guildId });

            if (args[0] === 'create') {
                if (guildSettings && guildSettings.setupChannelId) {
                    // Check if a setup channel already exists
                    const existingChannel = message.guild.channels.cache.get(guildSettings.setupChannelId);
                    if (existingChannel) {
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`A setup channel already exists: <#${existingChannel.id}>`);
                        return message.channel.send({ embeds: [embed] });
                    }
                }

                // Create a new setup channel
                const channel = await message.guild.channels.create({
                    name: 'music-requests',
                    type: 0, // or simply use '0'
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                    ],
                });

                await Guild.findOneAndUpdate(
                    { guildId },
                    { setupChannelId: channel.id },
                    { upsert: true }
                );
                const avatar = client.user.displayAvatarURL({ dynamic: true, size: 2048 });
                const embed = new EmbedBuilder()
                    .setColor('#0000FF')
                    .setAuthor({ name: 'Nothing is playing right now' })
                    .setImage(avatar);
                const messageSent = await channel.send({ embeds: [embed] });

                await Guild.findOneAndUpdate(
                    { guildId },
                    { setupChannelId: channel.id, embedMessageId: messageSent.id },
                    { upsert: true }
                );
                const responseEmbed = new EmbedBuilder()
                    .setColor('#0000FF')
                    .setDescription(`Setup channel created: <#${channel.id}>`);
                return message.channel.send({ embeds: [responseEmbed] });

            } else if (args[0] === 'delete') {
                if (guildSettings && guildSettings.setupChannelId) {
                    const channel = message.guild.channels.cache.get(guildSettings.setupChannelId);
                    if (channel) {
                        await channel.delete();
                    }
                    await Guild.findOneAndUpdate({ guildId }, { setupChannelId: null });
                    const responseEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('Setup channel deleted');
                    return message.channel.send({ embeds: [responseEmbed] });
                }

                const noChannelEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('No setup channel to delete');
                return message.channel.send({ embeds: [noChannelEmbed] });

            } else {
                const usageEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('Usage: !setup create | delete');
                return message.channel.send({ embeds: [usageEmbed] });
            }
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('An error occurred while executing the setup command.');
            return message.channel.send({ embeds: [errorEmbed] });
        }
    }
}
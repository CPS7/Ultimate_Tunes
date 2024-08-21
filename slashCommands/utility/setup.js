const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType,ApplicationCommandType } = require('discord.js');
const Guild = require("../../models/guilds")
module.exports = {
    name: 'setup',
    description: "Creates or deletes setup",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
        options: [
            {
                name: 'action',
                type: ApplicationCommandOptionType.String,
                description: 'Create or delete the setup channel',
                required: true,
                choices: [
                    {
                        name: 'Create',
                        value: 'create',
                    },
                    {
                        name: 'Delete',
                        value: 'delete',
                    },
                ],
            },
        ],
    run: async(client, interaction) => {
        const guildId = interaction.guild.id;
        const action = interaction.options.getString('action');

        try {
            const guildSettings = await Guild.findOne({ guildId });

            if (action === 'create') {
                if (guildSettings && guildSettings.setupChannelId) {
                    // Check if a setup channel already exists
                    const existingChannel = interaction.guild.channels.cache.get(guildSettings.setupChannelId);
                    if (existingChannel) {
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`A setup channel already exists: <#${existingChannel.id}>`);
                        return interaction.reply({ embeds: [embed] });
                    }
                }

                const channel = await interaction.guild.channels.create({
                    name: 'music-requests',
                    type: 0, // or simply use '0'
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                    ],
                });

                await Guild.findOneAndUpdate(
                    { guildId },
                    { setupChannelId: channel.id },
                    { upsert: true }
                );

                const avatar = interaction.client.user.displayAvatarURL({ dynamic: true, size: 2048 });
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
                return interaction.reply({ embeds: [responseEmbed] });

            } else if (action === 'delete') {
                if (guildSettings && guildSettings.setupChannelId) {
                    const channel = interaction.guild.channels.cache.get(guildSettings.setupChannelId);
                    if (channel) {
                        await channel.delete();
                    }
                    await Guild.findOneAndUpdate({ guildId }, { setupChannelId: null });
                    const responseEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('Setup channel deleted');
                    return interaction.reply({ embeds: [responseEmbed] });
                }
                const noChannelEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('No setup channel to delete');
                return interaction.reply({ embeds: [noChannelEmbed] });

            } else {
                const usageEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('Usage: /setup <create|delete>');
                return interaction.reply({ embeds: [usageEmbed] });
            }
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('An error occurred while executing the setup command.');
            return interaction.reply({ embeds: [errorEmbed] });
        }
    }
}

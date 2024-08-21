const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Guild = require("../models/guilds");

module.exports = async (client, player, track) => {
    // Fetch the guild object based on the player's guild ID
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

    // Fetch the channel object based on the player's text channel ID
    const textChannelId = player.textChannel;
    if (!textChannelId) {
        console.error('Text Channel ID is undefined. Check the player object:', player);
        return;
    }

    const channel = guild.channels.cache.get(textChannelId);
    if (!channel) {
        console.error(`Channel not found for ID: ${textChannelId}`);
        return;
    }

    // Function to create button components for message interactions
    function buttonBuilder() {
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('previous_button'),
                new ButtonBuilder()
                    .setLabel('⏯️')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('pause_button'),
                new ButtonBuilder()
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('skip_button')
            );

        const buttons2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('➖')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('volumeDown_button'),
                new ButtonBuilder()
                    .setLabel('⏹️')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('stop_button'),
                new ButtonBuilder()
                    .setLabel('➕')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('volumeUp_button')
            );

        return [buttons, buttons2];
    }

    // Function to format duration from seconds to mm:ss format
    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // Convert duration from milliseconds to seconds and format it
    const durationInSeconds = player.queue.current.duration / 1000;
    const formattedDuration = formatDuration(durationInSeconds);

    // Create an embed message to display track information
    const embed = new EmbedBuilder()
        .setColor("#0001D1")
        .setAuthor({ name: 'Now Playing...', iconURL: 'https://cdn.discordapp.com/emojis/741605543046807626.gif' })
        .addFields(
            { name: '**Track:**', value: `${track.title}`, inline: true },
            { name: '**Requested By:**', value: `||${track.requester.username}||` },
            { name: '**Source:**', value: `\`\`${track.sourceName}\`\`` },
            { name: '**Author:**', value: `${track.author}` },
            { name: '**Duration:**', value: formattedDuration }
        )
        .setThumbnail(track.artworkUrl);

    try {
        // Fetch guild settings from the database
        const guildSettings = await Guild.findOne({ guildId: guildId });
        if (!guildSettings) {
            console.error(`No guild settings found for ID: ${guildId}`);
            return;
        }

        // Extract setup channel ID and message ID from settings
        const setupChannelId = guildSettings.setupChannelId;
        const messageId = guildSettings.embedMessageId;

        if (setupChannelId) {
            // Fetch the text channel based on the setup channel ID
            const setupChannel = guild.channels.cache.get(setupChannelId);
            if (!setupChannel) {
                console.error(`Setup text channel not found for ID: ${setupChannelId}`);
                return;
            }

            if (messageId) {
                // If message ID exists, update the existing message in the setup channel
                const message = await setupChannel.messages.fetch(messageId);
                await message.edit({
                    embeds: [embed],
                    components: buttonBuilder()
                });
            } else {
                // If no message ID exists, send a new message to the setup channel
                const message = await setupChannel.send({
                    embeds: [embed],
                    components: buttonBuilder()
                });
                // Update the guild settings with the new message ID
                guildSettings.embedMessageId = message.id;
                await guildSettings.save();
            }
        }

        // Send or update the message in the current channel if it's different from the setup channel
        if (!setupChannelId || setupChannelId !== textChannelId) {
            const message = await channel.send({
                embeds: [embed],
                components: buttonBuilder()
            });
            player.nowPlayingMessage = message; // Store the message object in the player
            guildSettings.trackEmbedMessageId = message.id;
            await guildSettings.save();
        }

    } catch (error) {
        console.error('Error handling track start:', error);
    }
};

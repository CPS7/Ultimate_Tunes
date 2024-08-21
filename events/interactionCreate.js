const { EmbedBuilder, PermissionsBitField, Collection } = require('discord.js');
const ms = require('ms');
const client = require('..'); // Adjust the path as needed
const config = require('../config.json');
const Guild = require('../models/guilds');
const { UserSettings } = require('../utils/getUser');
const { isPremium } = require('../utils/isPremium')
 // Adjust the path as needed

const cooldown = new Collection();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return; // Ensure it's a slash command interaction

    const slashCommand = client.slashCommands.get(interaction.commandName);
    if (!slashCommand) return;

    // Handle autocomplete interactions
    if (interaction.isAutocomplete()) {
        if (slashCommand.autocomplete) {
            const choices = [];
            await slashCommand.autocomplete(interaction, choices);
        }
        return;
    }

    // Handle cooldown
    const cooldownKey = `slash-${slashCommand.name}-${interaction.user.id}`;
    if (slashCommand.cooldown) {
        if (cooldown.has(cooldownKey)) {
            const remainingTime = cooldown.get(cooldownKey) - Date.now();
            if (remainingTime > 0) {
                return interaction.reply({
                    content: `⏱ You need to wait ${client.duration(remainingTime)} more before using the \`${slashCommand.name}\` command again.`,
                    ephemeral: true // Make the message ephemeral for slash commands
                });
            }
        }
    }

    // Fetch user settings
    let Userop;
    try {
        Userop = await UserSettings(interaction.user.id);
    } catch (error) {
        console.error("Error fetching user settings:", error);
        return interaction.reply({ content: "🚫 An error occurred while fetching settings.", ephemeral: true });
    }

    if (!Userop) {
        return interaction.reply({ content: "🚫 Settings not found for this user.", ephemeral: true });
    }

    // Check if the command requires premium access
    if (slashCommand.premium && !isPremium(interaction, Userop)) {
        return interaction.reply({ content: "🚫 This command is restricted to premium users.", ephemeral: true });
    }

    // Check owner and admin restrictions
    if (slashCommand.ownerOnly && !config.ownerID.includes(interaction.user.id)) {
        return interaction.reply({ content: "🚫 This command is restricted to the bot owner.", ephemeral: true });
    }

    if (slashCommand.adminOnly && !config.ownerID.includes(interaction.user.id) && !config.adminID.includes(interaction.user.id)) {
        return interaction.reply({ content: "🚫 This command is restricted to the bot owner and admins.", ephemeral: true });
    }

    // Check permissions
    if (slashCommand.userPerms) {
        if (!interaction.member.permissions.has(PermissionsBitField.resolve(slashCommand.userPerms))) {
            const userPermsEmbed = new EmbedBuilder()
                .setDescription(`🚫 ${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`)
                .setColor('Red');
            return interaction.reply({ embeds: [userPermsEmbed], ephemeral: true });
        }
    }

    if (slashCommand.botPerms) {
        if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(slashCommand.botPerms))) {
            const botPermsEmbed = new EmbedBuilder()
                .setDescription(`🚫 ${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`)
                .setColor('Red');
            return interaction.reply({ embeds: [botPermsEmbed], ephemeral: true });
        }
    }

    // Check if a player is required
    const player = client.manager.players.get(interaction.guild.id);
    if (slashCommand.player && !player) {
        return interaction.reply({ content: "🚫 No active player found in this server.", ephemeral: true });
    }

    // Check if something is playing when required
    if (slashCommand.playing && (!player || !player.playing)) {
        return interaction.reply({ content: "🚫 No music is currently playing.", ephemeral: true });
    }

    // Check if user is in the same voice channel as the bot
    if (slashCommand.sameVoiceChannel) {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: "🚫 You need to be in a voice channel to use this command.", ephemeral: true });
        }
        if (interaction.guild.members.me.voice.channel && interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id) {
            return interaction.reply({ content: `🚫 You need to be in the same voice channel as me to use this command.`, ephemeral: true });
        }
    }

    // Execute the command
    try {
        await slashCommand.run(client, interaction);

        // Set cooldown
        if (slashCommand.cooldown) {
            cooldown.set(cooldownKey, Date.now() + slashCommand.cooldown);
            setTimeout(() => cooldown.delete(cooldownKey), slashCommand.cooldown);
        }
    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            interaction.reply({ content: '🚫 There was an error while executing this command!', ephemeral: true });
        }
    }
});

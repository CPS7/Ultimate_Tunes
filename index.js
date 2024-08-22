const { Client, GatewayIntentBits, Partials, Collection, PermissionsBitField, EmbedBuilder } = require('discord.js');
const Guild = require("./models/guilds");
const Magmastream = require("./magmastream");
const Embed = require('./models/Embed');
const fs = require('fs');
const config = require('./config.json');
require('dotenv').config();
const mongoose = require('mongoose');
const ms = require("ms");
const duration = require("./utils/duration");
const formatBytes = require("./utils/formatBytes");
const { getGuildSettings } = require('./utils/getGuildSettings');
const { isSetupChannelMessage } = require('./utils/isSetupChannelMessage');
const { UserSettings } = require('./utils/getUser');
const { isPremium } = require('./utils/isPremium')
const http = require("http")

if(config.alwaysOnlineReplit) {
    const PORT = process.env.PORT || 9600;
    const httpServer = http.createServer(
      function(request, response) {
        const value = response.socket;
        response.end("Socket buffersize : " + value.bufferSize, 'utf8', () => {
           console.log("displaying the result...");
        })
     });
    httpServer.listen(PORT, () => {
      console.log("Server is running at port 9600...");
    });
    const v = httpServer.keepAliveTimeout
    console.log('keep alive time out value :-' + v)
}

const client = new Client({
    allowedMentions: {
        parse: ["users", "roles", "everyone"],
        repliedUser: false,
    },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction],
});

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.manager = new Magmastream(client);
client.token = process.env.TOKEN;
client.url = config.uri;
client.nodes = config.nodes;
client.duration = duration;
client.formatBytes = formatBytes;
const cooldown = new Collection();
module.exports = client;

// Load handlers
fs.readdirSync('./handlers').forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

const handleBotMention = (message, prefix) => {
    // Check if the bot is mentioned
    if (message.content.includes(message.client.user.id)) {
        // Create an embed with information about the bot
        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('Hello! 👋')
            .setDescription(`It looks like you mentioned me! My prefix in this server is \`${prefix}\`.`)
            .addFields({ name: 'Need help?', value: `Use \`${prefix}help\` to see all the commands I can do!` })
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        // Send the embed as a reply
        message.reply({ embeds: [embed] });
    }
};

// Permission check
const hasRequiredPermissions = (message, command) => {
    const userPerms = command.userPerms || [];
    const botPerms = command.botPerms || [];

    const userHasPermissions = userPerms.every(perm => message.member.permissions.has(PermissionsBitField.resolve(perm)));
    if (!userHasPermissions) {
        const userPermsEmbed = new EmbedBuilder()
            .setDescription(`🚫 ${message.author}, You don't have \`${userPerms.join(', ')}\` permissions to use this command!`)
            .setColor('Red');
        message.reply({ embeds: [userPermsEmbed] });
        return false;
    }

    const botHasPermissions = botPerms.every(perm => message.guild.members.cache.get(message.client.user.id).permissions.has(PermissionsBitField.resolve(perm)));
    if (!botHasPermissions) {
        const botPermsEmbed = new EmbedBuilder()
            .setDescription(`🚫 ${message.author}, I don't have \`${botPerms.join(', ')}\` permissions to use this command!`)
            .setColor('Red');
        message.reply({ embeds: [botPermsEmbed] });
        return false;
    }

    return true;
};


const isOnCooldown = (message, command) => {
    const now = Date.now();
    const timestamps = cooldown.get(command.name) || new Map();
    const cooldownAmount = (command.cooldown || 3);

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            return expirationTime - now; // Return remaining time in milliseconds
        }
    }
    return null;
};

const sendCooldownMessage = (message, command) => {
    const cooldownAmount = (command.cooldown || 3);
    const timeLeft = (cooldownAmount - (Date.now() - (cooldown.get(command.name)?.get(message.author.id) || 0))); // Remaining time in milliseconds
    message.reply({
        content: `⏱ You need to wait ${client.duration(timeLeft)} more before using the \`${command.name}\` command again.`
    });
};

const setCooldown = (message, command) => {
    const now = Date.now();
    const cooldownAmount = (command.cooldown || 3);
    const timestamps = cooldown.get(command.name) || new Map();
    timestamps.set(message.author.id, now);
    cooldown.set(command.name, timestamps);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
};


// Handle command
const handleCommand = async (message, prefix) => {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift()?.toLowerCase();

    if (!cmd) return;

    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (!command) return;

    if (command.ownerOnly && !config.ownerIDs.includes(message.author.id)) {
        return message.reply({ content: "🚫 This command is restricted to the bot owner." });
    }

    // Admin-only check
    if (command.adminOnly && !config.ownerIDs.includes(message.author.id) && !config.adminIDs.includes(message.author.id)) {
        return message.reply({ content: "🚫 This command is restricted to the bot owner and admins." });
    }
    
    let Userop;
    try {
        Userop = await UserSettings(message.author.id, message.author.tag);
    } catch (error) {
        console.error("Error fetching user settings:", error);
        return message.reply({ content: "🚫 An error occurred while fetching settings." });
    }

    // Check if Userop is null (shouldn't be, but safe to handle)
    if (!Userop) {
        return message.reply({ content: "🚫 Settings not found for this user." });
    }

    // Check if the command requires premium access
    if (command.premium && !isPremium(message, Userop)) {
        return message.reply({ content: "🚫 This command is restricted to premium users." });
    }


    const player = client.manager.players.get(message.guild.id);

    if (command.player && !player) {
        return message.reply({ content: "🚫 No active player found in this server." });
    }

    if (command.playing && (!player || !player.playing)) {
        return message.reply({ content: "🚫 No music is currently playing." });
    }

    if (command.sameVoiceChannel) {
        if (!message.member.voice.channel) {
            return message.reply({ content: "🚫 You need to be in a voice channel to use this command." });
        }
        if (message.guild.members.me.voice.channel && message.member.voice.channel.id !== message.guild.members.me.voice.channel.id) {
            return message.reply({ content: "🚫 You need to be in the same voice channel as the bot to use this command." });
        }
    }

    if (!hasRequiredPermissions(message, command)) return;

    const cooldownTime = isOnCooldown(message, command);
    if (cooldownTime) {
        return sendCooldownMessage(message, command);
    }

    try {
        await command.run(client, message, args);
    } catch (error) {
        console.error('Error executing command:', error);
        message.reply('There was an error while executing the command.');
    }

    setCooldown(message, command);
};

// Delete messages from channel
const deleteMessagesFromChannel = async (channel) => {
    try {
        console.log(`Fetching messages from channel ${channel.id}`);
        const messages = await channel.messages.fetch({ limit: 100 });
        const messagesToDelete = messages.filter(msg => !msg.author.bot);

        console.log(`Found ${messagesToDelete.size} messages to delete`);
        for (const msg of messagesToDelete.values()) {
            try {
                console.log(`Attempting to delete message with ID ${msg.id}`);
                await msg.delete();
                console.log(`Successfully deleted message with ID ${msg.id}`);
            } catch (error) {
                console.error(`Error deleting message with ID ${msg.id}: ${error.message}`);
            }
        }
    } catch (error) {
        console.error(`Error fetching messages from channel ${channel.id}: ${error.message}`);
    }
};

// Play song
const playSong = async (message, songName) => {
    console.log(`Attempting to play song: ${songName}`);
    if (!message.guild) return;

    const member = message.guild.members.cache.get(message.author.id);
    if (!member) return;

    if (!member.voice.channelId) {
        return message.channel.send("You must be in a voice channel to play a song.").then(msg => setTimeout(() => msg.delete(), 5000));

    }

    const botCurrentVoiceChannelId = message.guild.members.me?.voice.channelId;

    if (botCurrentVoiceChannelId && member.voice.channelId !== botCurrentVoiceChannelId) {
        return message.channel.send(`You must be connected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`).then(msg => setTimeout(() => msg.delete(), 5000));

    }

    const player = client.manager.create({
        guild: message.guildId,
        textChannel: message.channelId,
        voiceChannel: message.member.voice.channelId,
        selfDeafen: true,
        volume: 100,
    });

    if (player.state !== "CONNECTED") player.connect();

    const result = await client.manager.search(songName, message.author);

    switch (result.loadType) {
        case "empty":
            if (!player.queue.current) player.destroy();
            return await message.reply({
                content: `Load failed when searching for \`${songName}\``,
            }).then(msg => setTimeout(() => msg.delete(), 5000));

        case "error":
            if (!player.queue.current) player.destroy();
            return await message.reply({
                content: `No matches when searching for \`${songName}\``,
            }).then(msg => setTimeout(() => msg.delete(), 5000));

        case "track":
            player.queue.add(result.tracks[0]);
            await message.reply({
                content: `Added [${result.tracks[0].title}](<${result.tracks[0].uri}>) to the queue.`,
            }).then(msg => setTimeout(() => msg.delete(), 5000));
            if (!player.playing && !player.paused && !player.queue.length) {
                await player.play();
            }
            break;

        case "playlist":
            if (!result.playlist?.tracks) return;
            player.queue.add(result.playlist.tracks);
            await message.reply({
                content: `Added [${result.playlist.name}](<${songName}>) playlist to the queue.`,
            }).then(msg => setTimeout(() => msg.delete(), 5000));
            if (!player.playing && !player.paused && player.queue.size === result.playlist.tracks.length) {
                await player.play();
            }
            break;

        case "search":
            player.queue.add(result.tracks[0]);
            await message.reply({
                content: `Added [${result.tracks[0].title}](<${result.tracks[0].uri}>) to the queue.`,
            }).then(msg => setTimeout(() => msg.delete(), 5000));
            if (!player.playing && !player.paused && !player.queue.length) {
                await player.play();
            }
            break;
    }

    // Delete messages in the setup channel after song search logic

    const guildId = message.guild.id;
    const guildSettings = await Guild.findOne({ guildId });

    if (!guildSettings) {
        console.log("Guild settings not found.");
        return;
    }

    const setupChannel = message.guild.channels.cache.get(guildSettings.setupChannelId);
    if (setupChannel) {
        await deleteMessagesFromChannel(setupChannel);
    }
};

// Event listeners
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    let guildSettings;
    try {
        guildSettings = await getGuildSettings(message.guild.id);
    } catch (error) {
        console.error('Error fetching guild settings:', error);
        return; // Continue processing other messages even if there’s an error
    }

    const player = client.manager.players.get(message.guild.id);

    // If setup channel ID is defined, handle setup channel messages
    if (guildSettings && guildSettings.setupChannelId) {
        if (message.channel.id === guildSettings.setupChannelId) {
            const songName = message.content.trim();
            if (songName) {
                try {
                    await playSong(message, songName);
                    return; // Exit early after handling the setup channel message
                } catch (error) {
                    console.error('Error playing song:', error);
                }
            }
        }
    }

    // Check if guildSettings exists before accessing its properties
    const prefix = guildSettings?.prefix || config.prefix;
    
    // Handle regular commands and mentions in normal channels
    if (message.content.startsWith(prefix)) {
        try {
            await handleCommand(message, prefix);
        } catch (error) {
            console.error('Error handling command:', error);
        }
    } else {
        try {
            await handleBotMention(message, prefix);
        } catch (error) {
            console.error('Error handling bot mention:', error);
        }
    }
});



client.on('raw', (d) => client.manager.updateVoiceState(d));

// Login
client.login(client.token);

// Process error handling
process.removeAllListeners("warning");
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.error('Uncaught Exception thrown:', err, 'Exception origin:', origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error('Uncaught Exception Monitor:', err, 'Exception origin:', origin);
});

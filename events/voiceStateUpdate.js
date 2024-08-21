const { ChannelType, EmbedBuilder } = require("discord.js");
const client = require('..');
const Player = require('../models/player');
const Guild = require('../models/guilds');
const chalk = require('chalk');

client.on('voiceStateUpdate', async (oldState, newState) => {
  const playeropt = await Player.findOne({ guildId: newState.guild.id });

  // Handle bot's voice state updates
  if (newState.member && newState.member.id === client.user.id) {
    if (!newState.channelId) {
      let guildData = await Guild.findOne({ guildId: newState.guild.id });
      if (!guildData) {
        return;
      }

      if (playeropt) {
        setTimeout(() => {
          const player = client.manager.create({
            guild: guildData.id,
            textChannel: playeropt.textChannelId,
            voiceChannel: playeropt.voiceChannelId,
            selfDeafen: true,
            volume: 100,
          });
          if (!player.voiceChannel) {
            return;
          }
          if (player.state !== "CONNECTED") {
            return player.connect();
          }
        }, 500);
      }
    } else {
      if (
        newState.channel.type === ChannelType.GuildStageVoice &&
        newState.guild.members.me?.voice.suppress
      ) {
        newState.setSuppressed(false).catch(() => null);
      }
      if (!client.manager.get(newState.guild.id)) return;
      const player = client.manager.get(newState.guild.id);
      player.voiceChannel = newState.channelId;
      if (player.paused) return;
      player.pause(true);
      setTimeout(() => {
        player.pause(false);
      }, 150);
    }
  }

  let guildData = await Guild.findOne({ guildId: newState.guild.id });

  // Handle bot being muted
  if (newState.member.id === client.user.id && newState.serverMute) {
    console.log("Bot has been server-muted.");
    if (guildData && playeropt) {
      const textChannel = await client.channels.fetch(playeropt.textChannelId);
      if (textChannel && textChannel.type === ChannelType.GuildText) {
        try {
          await textChannel.send("I got muted.");
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      }
    }
  }

  // Handle bot alone in voice channel
  if (
    !newState.channelId &&
    oldState.channelId === newState.guild.members.me?.voice.channelId &&
    client.manager.get(newState.guild.id) &&
    !newState.guild.members.me?.voice.channel.members.filter(
      ({ user: { bot } }) => !bot
    ).size
  ) {
    setTimeout(async () => {
      guildData = await Guild.findOne({ guildId: newState.guild.id });
      if (
        client.manager.get(newState.guild.id) &&
        oldState.channelId ===
          client.guilds.cache.get(newState.guild.id)?.members.me?.voice
            .channelId &&
        !client.guilds.cache
          .get(newState.guild.id)
          ?.members.me?.voice.channel.members.filter(
            ({ user: { bot } }) => !bot
          ).size
      ) {
        const player = client.manager.get(newState.guild.id);

        if (player && player.textChannel) {
          try {
            const textChannel = await client.channels.fetch(player.textChannel);
            if (textChannel && textChannel.type === ChannelType.GuildText) {
              const m = await textChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(
                      `Disconnected due to inactivity. To prevent this, enable 24/7 mode.`
                    ),
                ],
              });
              setTimeout(async () => await m.delete(), 15000);
            }
          } catch (error) {
            console.error(`Failed to send or delete message: ${error}`);
          }
        }

        player.destroy();
      }
    }, 5000); // Inactivity timeout of 30 seconds
  } else if (
    !newState.channelId &&
    oldState.channelId === newState.guild.members.me?.voice.channelId &&
    !newState.guild.members.me?.voice.channel.members.size &&
    !client.manager.get(newState.guild.id) &&
    playeropt
  ) {
    setTimeout(async () => {
      guildData = await Guild.findOne({ guildId: newState.guild.id });
      if (
        !newState.channelId &&
        oldState.channelId === newState.guild.members.me?.voice.channelId &&
        !client.guilds.cache
          .get(newState.guild.id)
          ?.members.me?.voice.channel.members.size
      ) {
        const player = client.manager.get(newState.guild.id);

        if (player && player.textChannel) {
          try {
            const textChannel = await client.channels.fetch(player.textChannel);
            if (textChannel && textChannel.type === ChannelType.GuildText) {
              const m = await textChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(
                      `Disconnected due to being alone.`
                    ),
                ],
              });
              setTimeout(async () => await m.delete(), 50000);
            }
          } catch (error) {
            console.error(`Failed to send or delete message: ${error}`);
          }
        }

        player.destroy();
      }
    }, 5000); // Timeout of 5 seconds if the bot is alone
  }
});

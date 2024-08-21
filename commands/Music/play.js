const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { aliases } = require('../..');
const playerDestroy = require('../../Magmastream/playerDestroy');
const queueEnd = require('../../Magmastream/queueEnd');


module.exports = {
    name: 'play',
    description: "Play Music",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    aliases:["p","pl"],
    run: async(client, message, args) => {
        if (!message.member.voice.channel) return message.reply('you need to join a voice channel.');
        if (!args.length) return message.reply('you need to give me a URL or a search term.');
        const botCurrentVoiceChannelId = message.client.user.voiceChannel

        if (
            botCurrentVoiceChannelId &&
            member.voice.channelId &&
            member.voice.channelId !== botCurrentVoiceChannelId
          ) {
            return await message.reply({
              content: `You must be connnected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`,
            });
          }

        const player = client.manager.create({
            guild: message.guildId,
            textChannel: message.channelId,
            voiceChannel: message.member.voice.channelId,
            selfDeafen: true,
            volume: 100,
        });

        if (player.state !== "CONNECTED") player.connect();

        const search = args.join(' ');
        result = await client.manager.search(search, message.author);
        switch (result.loadType) {
            case "empty":
              if (!player.queue.current) player.destroy();
      
              return await message.reply({
                content: `Load failed when searching for \`${search}\``,
              });
      
            case "error":
              if (!player.queue.current) player.destroy();
      
              return await message.reply({
                content: `No matches when searching for \`${search}\``,
              });
      
            case "track":
              player.queue.add(result.tracks[0]);
              await message.reply({
                content: `Added [${result.tracks[0].title}](<${result.tracks[0].uri}>) to the queue.`,
              });
      
              if (!player.playing && !player.paused && !player.queue.length) {
                await player.play();
                return
              }
      
              case "playlist":
                if (!result.playlist?.tracks) return;
        
                if (Array.isArray(result.playlist.tracks) && result.playlist.tracks.length > 0) {
                    player.queue.add(result.playlist.tracks);
                    await message.reply({
                        content: `Added [${result.playlist.name}](<${search}>) playlist to the queue.`,
                    });
        
                    if (!player.playing && !player.paused && player.queue.size === result.playlist.tracks.length) {
                        await player.play();
                        return;
                    }
                } else {
                    await message.reply({
                        content: `The playlist is empty or tracks are not properly loaded.`,
                    });
                }
        
            case "search":
              player.queue.add(result.tracks[0]);
              await message.reply({
                content: `Added [${result.tracks[0].title}](<${result.tracks[0].uri}>) to the queue.`,
              });
              if (!player.playing && !player.paused && !player.queue.length) {
                await player.play();
                return
              }
            }
    }
}
  
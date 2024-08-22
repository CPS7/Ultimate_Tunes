const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js")
module.exports = {
    name: "play",
    description: "Play songs",
    type: ApplicationCommandType.ChatInput,
    cooldown:3000,
    options: [{
        name: 'song',
        description: 'The Song you want to play.',
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    sameVoiceChannel:true,
    category: "music",
    
    run: async (client, interaction) => {
        if (!interaction.guild || !interaction.guildId) return;
        if (!interaction.replied || interaction.deferred) {
            await interaction.deferReply({
                ephemeral: false,
            });
        }

        const query = interaction.options.getString("song", true);
        const member = interaction.guild.members.cache.get(interaction.user.id);

        if (!member) return;

        if (!member.voice.channelId) {
            return await interaction.editReply({
                content: "You must be in a voice channel to use this command.",
            });
        }

        const botCurrentVoiceChannelId =
            interaction.guild.members.me?.voice.channelId;

        if (
            botCurrentVoiceChannelId &&
            member.voice.channelId &&
            member.voice.channelId !== botCurrentVoiceChannelId
        ) {
            return await interaction.editReply({
                content: `You must be connnected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`,
            });
        }

        const player = client.manager.create({
            guild: interaction.guildId,
            textChannel: interaction.channelId,
            voiceChannel: member.voice.channelId,
            selfDeafen: true,
            volume: 100,
        });

        if (player.state !== "CONNECTED") player.connect();

        const result = await player.search(query, interaction.user);

        switch (result.loadType) {
            case "empty":
                if (!player.queue.size === 0) player.destroy();

                return await interaction.editReply({
                    content: `Load failed when searching for \`${query}\``,
                });

            case "error":
                if (!player.queue.current) player.destroy();

                return await interaction.editReply({
                    content: `No matches when searching for \`${query}\``,
                });

            case "track":
                player.queue.add(result.tracks[0]);
                await interaction.editReply({
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
                    await interaction.editReply({
                        content: `Added [${result.playlist.name}](<${query}>) playlist to the queue.`,
                    });
        
                    if (!player.playing && !player.paused && player.queue.size === result.playlist.tracks.length) {
                        await player.play();
                        return;
                    }
                } else {
                    await interaction.editReply({
                        content: `The playlist is empty or tracks are not properly loaded.`,
                    });
                }

            case "search":
                player.queue.add(result.tracks[0]);
                await interaction.editReply({
                    content: `Added [${result.tracks[0].title}](<${result.tracks[0].uri}>) to the queue.`,
                })
                if (!player.playing && !player.paused && !player.queue.length) {
                    await player.play();
                    return
                }

        }
    }
}
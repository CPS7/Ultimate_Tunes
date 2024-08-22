const { EmbedBuilder } = require("discord.js");

const voteCollectors = new Map();

module.exports = {
    name: 'previous',
    description: "Replay the previous track",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    aliases: ["prev","pr"],
    playing: true,
    player: true,
    sameVoiceChannel:true,
    category: "music",
    usage: "<prefix>previous",
    run: async (client, message, args) => {

        const player = message.client.manager.players.get(message.guild.id);

        // Check if there's a previous track available
        const currentTrack = player.queue.current;
        const previousTrack = player.queue.previous; // Assuming `queue.previous` gives the previous track
        const requester = currentTrack.requester;

        if (!previousTrack) {
            const noPreviousEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('There is no previous track to play.');
            return await message.channel.send({ embeds: [noPreviousEmbed] });
        }

        // If the requester initiates the play, play the previous track directly
        if (message.author.id === requester.id) {
            player.previous();
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Playing the previous track.`);
            await message.channel.send({ embeds: [embed] });
        } else {
            // Handle voting system
            const voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You need to be in a voice channel to initiate a previous track vote.');
                return await message.channel.send({ embeds: [embed] });
            }

            const membersInChannel = voiceChannel.members.filter(member => !member.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Vote to play the previous track initiated. React with 👍 to vote. ${0}/${requiredVotes} votes.`);
            const sentMessage = await message.channel.send({ embeds: [embed] });

            // Add initial reaction
            await sentMessage.react('👍');

            const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
            const collector = sentMessage.createReactionCollector({ filter, time: 60000 });

            voteCollectors.set(message.guild.id, collector);

            collector.on('collect', async (reaction, user) => {
                const totalVotes = reaction.users.cache.filter(user => !user.bot).size;
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription(`Vote to play the previous track initiated. React with 👍 to vote. ${totalVotes}/${requiredVotes} votes.`);
                await sentMessage.edit({ embeds: [updatedEmbed] });

                if (totalVotes >= requiredVotes) {
                    player.previous();
                    voteCollectors.delete(message.guild.id); // Remove collector
                    const successEmbed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setDescription(`Vote passed! Playing the previous track.`);
                    await message.channel.send({ embeds: [successEmbed] });
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                if (player.queue.current === currentTrack) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Vote to play the previous track timed out.');
                    await message.channel.send({ embeds: [timeoutEmbed] });
                }
            });

            // Schedule the deletion of the sent message
            setTimeout(async () => {
                try {
                    if (sentMessage.deletable) await sentMessage.delete();
                } catch (error) {
                    console.log('Failed to delete message:', error);
                }
            }, 5000);
        }
    }
};

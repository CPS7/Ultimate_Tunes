const { EmbedBuilder } = require("discord.js");
const trackEnd = require("../../Magmastream/trackEnd");

const voteCollectors = new Map();

module.exports = {
    name: 'skip',
    description: "Skip Music",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    aliases: ["sk"],
    run: async (client, message, args) => {
        const player = message.client.manager.players.get(message.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('No player is active in this server.');
            return await message.channel.send({ embeds: [embed] });
        }

        const currentTrack = player.queue.current;
        if (!currentTrack) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('No track is currently playing.');
            return await message.channel.send({ embeds: [embed] });
        }

        const requester = currentTrack.requester;

        if (player.queue.size === 0) {
            const noMoreTracksEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('There are no more tracks in the queue to skip to.');
            return await message.channel.send({ embeds: [noMoreTracksEmbed] });
        }

        // If the requester initiates the skip, skip directly
        if (message.author.id === requester.id) {
            player.stop();
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Skipped the current track.`);
            await message.channel.send({ embeds: [embed] });
        } else {
            // Handle voting system
            const voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You need to be in a voice channel to initiate a skip vote.');
                return await message.channel.send({ embeds: [embed] });
            }

            const membersInChannel = voiceChannel.members.filter(member => !member.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Vote to skip initiated. React with 👍 to vote. ${0}/${requiredVotes} votes.`);
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
                    .setDescription(`Vote to skip initiated. React with 👍 to vote. ${totalVotes}/${requiredVotes} votes.`);
                await sentMessage.edit({ embeds: [updatedEmbed] });

                if (totalVotes >= requiredVotes) {
                    player.stop();
                    voteCollectors.delete(message.guild.id); // Remove collector
                    const successEmbed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setDescription(`Vote skip passed! Skipped the current track.`);
                    await message.channel.send({ embeds: [successEmbed] });
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                if (player.queue.current === currentTrack) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Vote to skip timed out.');
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

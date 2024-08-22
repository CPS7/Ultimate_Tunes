const { EmbedBuilder } = require("discord.js");

const voteCollectors = new Map();

module.exports = {
    name: 'replay',
    description: "Replay the current track",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    aliases:["r","rp"],
    playing: true,
    player: true,
    sameVoiceChannel:true,
    category: "music",
    usage: "<prefix>replay",
    run: async(client, message, args) => {
        const player = client.manager.players.get(message.guild.id);

        const currentTrack = player.queue.current;
        const requester = currentTrack.requester;

        if (message.author.id === requester.id) {
            player.restart();
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription('Replayed the current track.');
            await message.channel.send({ embeds: [embed] });
        } else {
            const voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You need to be in a voice channel to initiate a replay vote.');
                return message.channel.send({ embeds: [embed] });
            }

            const membersInChannel = voiceChannel.members.filter(member => !member.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Vote to replay the current track initiated. React with 👍 to vote. ${0}/${requiredVotes} votes.`);
            const sentMessage = await message.channel.send({ embeds: [embed] });

            await sentMessage.react('👍');

            const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
            const collector = sentMessage.createReactionCollector({ filter, time: 60000 });

            voteCollectors.set(message.guild.id, collector);

            collector.on('collect', async (reaction) => {
                const totalVotes = reaction.users.cache.filter(user => !user.bot).size;
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription(`Vote to replay the current track initiated. React with 👍 to vote. ${totalVotes}/${requiredVotes} votes.`);
                await sentMessage.edit({ embeds: [updatedEmbed] });

                if (totalVotes >= requiredVotes) {
                    player.restart();
                    voteCollectors.delete(message.guild.id);
                    const successEmbed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setDescription('Vote passed! Replayed the current track.');
                    await message.channel.send({ embeds: [successEmbed] });
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                if (player.queue.current === currentTrack) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Vote to replay the current track timed out.');
                    await message.channel.send({ embeds: [timeoutEmbed] });
                }
            });

            setTimeout(async () => {
                try {
                    if (sentMessage.deletable) await sentMessage.delete();
                } catch (error) {
                    console.log('Failed to delete message:', error);
                }
            }, 5000);
        }
    }
}
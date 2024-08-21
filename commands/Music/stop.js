const { EmbedBuilder } = require("discord.js");
const Player = require("../../models/player")

const voteCollectors = new Map();

module.exports = {
    name: 'stop',
    description: "Stop Music",
    cooldown: 3000,
    userPerms: [],
    botPerms: [],
    aliases: ["s", "st"],
    run: async (client, message, args) => {
        const playeropt = await Player.findOne({ guildId: message.guild.id });
        const player = client.manager.players.get(message.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription('There is no music currently playing.');
            return await message.reply({ embeds: [embed] });
        }

        const currentTrack = player.queue.current;
        const requester = currentTrack ? currentTrack.requester : null;

        // If the requester or DJ stops the music, stop directly
        if (message.author.id === requester?.id || message.member.roles.cache.some(role => role.name === "DJ")) {
            if (!playeropt) {
                player.stop();
                player.destroy();
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription('Stopped the music and left the voice channel.');
                return await message.reply({ embeds: [embed] });
            } else {
                player.stop();
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription('Stopped the music and left the voice channel.');
                return await message.reply({ embeds: [embed] });
            }
        } else {
            // Handle voting system
            const voiceChannel = message.member.voice.channel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You need to be in a voice channel to initiate a stop vote.');
                return await message.reply({ embeds: [embed] });
            }

            const membersInChannel = voiceChannel.members.filter(member => !member.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Vote to stop the music initiated. React with 👍 to vote. ${0}/${requiredVotes} votes.`);
            const sentMessage = await message.channel.send({ embeds: [embed] });

            await sentMessage.react('👍');

            const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
            const collector = sentMessage.createReactionCollector({ filter, time: 60000 });

            voteCollectors.set(message.guild.id, collector);

            collector.on('collect', async (reaction) => {
                const totalVotes = reaction.users.cache.filter(user => !user.bot).size;
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription(`Vote to stop the music initiated. React with 👍 to vote. ${totalVotes}/${requiredVotes} votes.`);
                await sentMessage.edit({ embeds: [updatedEmbed] });

                if (totalVotes >= requiredVotes) {
                    if (!playeropt) {
                    player.stop();
                    player.destroy();
                } else {
                    player.stop();
                }
                    voteCollectors.delete(message.guild.id);
                    const successEmbed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setDescription('Vote passed! Stopped the music and left the voice channel.');
                    await message.channel.send({ embeds: [successEmbed] });
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                if (player.queue.current === currentTrack) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Vote to stop the music timed out.');
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
};

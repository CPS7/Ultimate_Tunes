const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js")
const voteCollectors = new Map();
const Player = require("../../models/player")

module.exports = {
    name: "stop",
    description: "Stop songs",
    type: ApplicationCommandType.ChatInput,
    cooldown:3000,
    category: 'music',
    player: true,
    playing: true,
    sameVoiceChannel: true,
    run: async (client, interaction) => {
        const playeropt = await Player.findOne({ guildId: interaction.guildId });
        if (!interaction.guild || !interaction.guildId) return;

        const player = client.manager.players.get(interaction.guild.id);


        const currentTrack = player.queue.current;
        const requester = currentTrack ? currentTrack.requester : null;

        if (interaction.user.id === requester?.id || interaction.member.roles.cache.some(role => role.name === "DJ")) {
            if (!playeropt) {
                player.stop();
                player.destroy();
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription('Stopped the music and left the voice channel.');
                return await interaction.reply({ embeds: [embed] });
            } else {
                player.stop();
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription('Stopped the music.');
                return await interaction.reply({ embeds: [embed] });
            }
        } else {
            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You need to be in a voice channel to initiate a stop vote.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const membersInChannel = voiceChannel.members.filter(member => !member.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Vote to stop the music initiated. React with 👍 to vote. ${0}/${requiredVotes} votes.`);
            const message = await interaction.reply({ embeds: [embed], fetchReply: true });

            await message.react('👍');

            const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
            const collector = message.createReactionCollector({ filter, time: 60000 });

            voteCollectors.set(interaction.guild.id, collector);

            collector.on('collect', async (reaction) => {
                const totalVotes = reaction.users.cache.filter(user => !user.bot).size;
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription(`Vote to stop the music initiated. React with 👍 to vote. ${totalVotes}/${requiredVotes} votes.`);
                await message.edit({ embeds: [updatedEmbed] });

                if (totalVotes >= requiredVotes) {
                    if (!playeropt) {
                        player.stop();
                        player.destroy();
                    } else {
                        player.stop();
                    }
                    voteCollectors.delete(interaction.guild.id);
                    const successEmbed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setDescription('Vote passed! Stopped the music and left the voice channel.');
                    await interaction.followUp({ embeds: [successEmbed] });
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                if (player.queue.current === currentTrack) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Vote to stop the music timed out.');
                    await interaction.followUp({ embeds: [timeoutEmbed] });
                }
            });

            setTimeout(async () => {
                try {
                    if (message.deletable) await message.delete();
                } catch (error) {
                    console.log('Failed to delete message:', error);
                }
            }, 5000);
        }
    }
}
const { ApplicationCommandType, EmbedBuilder } = require("discord.js");

const voteCollectors = new Map();

module.exports = {
    name: "previous",
    description: "Replay the previous track",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    category: 'music',
    player: true,
    playing: true,
    sameVoiceChannel: true,
    run: async (client, interaction) => {

        const player = interaction.client.manager.players.get(interaction.guild.id);

        // Check if there's a previous track available
        const currentTrack = player.queue.current;
        const previousTrack = player.queue.previous; // Assuming `queue.previous` gives the previous track
        const requester = currentTrack.requester;

        if (!previousTrack) {
            const noPreviousEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('There is no previous track to play.');
            return await interaction.reply({ embeds: [noPreviousEmbed], ephemeral: true });
        }

        // If the requester initiates the skip, skip directly
        if (interaction.user.id === requester.id) {
            player.previous();
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Played the previous track.`);
            await interaction.reply({ embeds: [embed] });
        } else {
            // Handle voting system
            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You need to be in a voice channel to initiate a previous vote.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const membersInChannel = voiceChannel.members.filter(member => !member.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Vote to play the previous track initiated. React with 👍 to vote. ${0}/${requiredVotes} votes.`);
            const message = await interaction.reply({ embeds: [embed], fetchReply: true });

            // Add initial reaction
            await message.react('👍');

            const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
            const collector = message.createReactionCollector({ filter, time: 60000 });

            voteCollectors.set(interaction.guild.id, collector);

            collector.on('collect', async (reaction, user) => {
                const totalVotes = reaction.users.cache.filter(user => !user.bot).size;
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription(`Vote to play the previous track initiated. React with 👍 to vote. ${totalVotes}/${requiredVotes} votes.`);
                await message.edit({ embeds: [updatedEmbed] });

                if (totalVotes >= requiredVotes) {
                    player.previous();
                    voteCollectors.delete(interaction.guild.id); // Remove collector
                    const successEmbed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setDescription(`Vote passed! Playing the previous track.`);
                    await interaction.followUp({ embeds: [successEmbed] });
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                if (player.queue.current === currentTrack) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Vote to play the previous track timed out.');
                    await interaction.followUp({ embeds: [timeoutEmbed] });
                }
            });
        }

        setTimeout(async () => {
            try {
                await interaction.deleteReply();
            } catch (error) {
                console.log('Failed to delete interaction reply:', error);
            }
        }, 5000);
    }
}
const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const trackEnd = require("../../Magmastream/trackEnd");

const voteCollectors = new Map();

module.exports = {
    name: "skip",
    description: "Skip songs",
    type: ApplicationCommandType.ChatInput,
    cooldown:3000,
    category: 'music',
    player: true,
    playing: true,
    sameVoiceChannel: true,
    run: async (client, interaction) => {
        const player = interaction.client.manager.players.get(interaction.guild.id);
        
        const currentTrack = player.queue.current;
        const requester = currentTrack.requester;

        if (player.queue.size === 0) {
            const noMoreTracksEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('There are no more tracks in the queue to skip to.');
            return await interaction.reply({embeds: [noMoreTracksEmbed], ephemeral: true});
        }

        // If the requester initiates the skip, skip directly
        if (interaction.user.id === requester.id) {
            player.stop();
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Skipped the current track.`);
            await interaction.reply({embeds: [embed]});
        } else {
            // Handle voting system
            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You need to be in a voice channel to initiate a skip vote.');
                return await interaction.reply({embeds: [embed], ephemeral: true});
            }

            const membersInChannel = voiceChannel.members.filter(member => !member.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);
            
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Vote to skip initiated. React with 👍 to vote. ${0}/${requiredVotes} votes.`);
            const message = await interaction.reply({embeds: [embed], fetchReply: true});
            
            // Add initial reaction
            await message.react('👍');

            const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
            const collector = message.createReactionCollector({ filter, time: 60000 });

            voteCollectors.set(interaction.guild.id, collector);

            collector.on('collect', async (reaction, user) => {
                const totalVotes = reaction.users.cache.filter(user => !user.bot).size;
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription(`Vote to skip initiated. React with 👍 to vote. ${totalVotes}/${requiredVotes} votes.`);
                await message.edit({embeds: [updatedEmbed]});
                
                if (totalVotes >= requiredVotes) {
                    player.stop();
                    voteCollectors.delete(interaction.guild.id); // Remove collector
                    const successEmbed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setDescription(`Vote skip passed! Skipped the current track.`);
                    await interaction.followUp({embeds: [successEmbed]});
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                if (player.queue.current === currentTrack) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Vote to skip timed out.');
                    await interaction.followUp({embeds: [timeoutEmbed]});
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
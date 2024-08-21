const { EmbedBuilder } = require("discord.js");
const { cooldown } = require("../slashCommands/music/stop");

// Map to track reaction collectors (guildId -> Collector)
const voteCollectors = new Map();

module.exports = {
    id: 'pause_button',
    permissions: [],
    cooldown: 3000,
    run: async (client, interaction) => {
        const player = interaction.client.manager.players.get(interaction.guild.id);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('No player is active in this server.');
            return await interaction.reply({embeds: [embed], ephemeral: true});
        }

        const currentTrack = player.queue.current;
        const requester = currentTrack.requester;

        // If the requester initiates the pause/resume, do it directly
        if (interaction.user.id === requester.id) {
            if (player.paused) {
                player.pause(false);
                embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription("Resumed the song");
            } else {
                player.pause(true);
                embed = new EmbedBuilder()
                    .setColor('Aqua')
                    .setDescription("Paused the song");
            }
            await interaction.reply({ embeds: [embed] });

        } else {
            // Handle voting system
            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You need to be in a voice channel to initiate a pause/resume vote.');
                return await interaction.reply({embeds: [embed], ephemeral: true});
            }

            const membersInChannel = voiceChannel.members.filter(member => !member.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Vote to ${player.paused ? 'resume' : 'pause'} initiated. React with 👍 to vote. ${0}/${requiredVotes} votes.`);
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
                    .setDescription(`Vote to ${player.paused ? 'resume' : 'pause'} initiated. React with 👍 to vote. ${totalVotes}/${requiredVotes} votes.`);
                await message.edit({embeds: [updatedEmbed]});

                if (totalVotes >= requiredVotes) {
                    if (player.paused) {
                        player.pause(false);
                        successEmbed = new EmbedBuilder()
                            .setColor('Green')
                            .setDescription("Resumed the song");
                    } else {
                        player.pause(true);
                        successEmbed = new EmbedBuilder()
                            .setColor('Aqua')
                            .setDescription("Paused the song");
                    }
                    await interaction.followUp({embeds: [successEmbed]});
                    voteCollectors.delete(interaction.guild.id); // Remove collector
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                if (player.queue.current === currentTrack) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Vote to pause/resume timed out.');
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
};

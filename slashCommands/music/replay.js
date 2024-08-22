const { ApplicationCommandType, EmbedBuilder } = require("discord.js");

const voteCollectors = new Map();

module.exports = {
    name: "replay",
    description: "Replay the current track",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    category: 'music',
    player: true,
    playing: true,
    sameVoiceChannel: true,
    run: async (client, interaction) => {
        if (!interaction.guild || !interaction.guildId) return;

        if (!interaction.replied || interaction.deferred) {
            await interaction.deferReply({ ephemeral: false });
        }

        const player = interaction.client.manager.players.get(interaction.guild.id);


        const currentTrack = player.queue.current;
        const requester = currentTrack.requester;

        if (interaction.user.id === requester.id) {
            player.restart();
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription('Replayed the current track.');
            await interaction.editReply({ embeds: [embed] });
        } else {
            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You need to be in a voice channel to initiate a replay vote.');
                return await interaction.editReply({ embeds: [embed] });
            }

            const membersInChannel = voiceChannel.members.filter(member => !member.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`Vote to replay the current track initiated. React with 👍 to vote. ${0}/${requiredVotes} votes.`);
            const message = await interaction.editReply({ embeds: [embed], fetchReply: true });

            await message.react('👍');

            const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
            const collector = message.createReactionCollector({ filter, time: 60000 });

            voteCollectors.set(interaction.guild.id, collector);

            collector.on('collect', async (reaction, user) => {
                const totalVotes = reaction.users.cache.filter(user => !user.bot).size;
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription(`Vote to replay the current track initiated. React with 👍 to vote. ${totalVotes}/${requiredVotes} votes.`);
                await message.edit({ embeds: [updatedEmbed] });

                if (totalVotes >= requiredVotes) {
                    player.restart();
                    voteCollectors.delete(interaction.guild.id);
                    const successEmbed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setDescription('Vote passed! Replayed the current track.');
                    await interaction.followUp({ embeds: [successEmbed] });
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                if (player.queue.current === currentTrack) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Vote to replay the current track timed out.');
                    await interaction.followUp({ embeds: [timeoutEmbed] });
                }
            });

            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    console.log('Failed to delete interaction reply:', error);
                }
            }, 5000);
        }
    }
};

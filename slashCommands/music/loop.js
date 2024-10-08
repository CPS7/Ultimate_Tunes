const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { cooldown } = require("../../commands/Music/skip");
const Player = require("../../models/player");

module.exports = {
    name: "loop",
    description: "put song on loop",
    cooldown:3000,
    category: 'music',
    player: true,
    playing: true,
    sameVoiceChannel: true,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'mode',
            description: 'Enable or disable loop mode',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Enable',
                    value: 'enable'
                },
                {
                    name: 'Disable',
                    value: 'disable'
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        const mode = interaction.options.getString('mode');
        const player = interaction.client.manager.players.get(interaction.guild.id);

    
        if (mode === 'enable') {
            player.trackRepeat = true
            const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("Song is now on loop.")
                return interaction.reply({embeds: [embed]});
        }
        if (mode === 'disable') {
            player.trackRepeat(true);
            const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setDescription("Song is now not on loop.")
                return interaction.reply({embeds: [embed]});
        }
    }
}
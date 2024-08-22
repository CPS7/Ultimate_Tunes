const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType } = require('discord.js');
const Guild = require("../../models/guilds")

module.exports = {
    name: 'prefix',
    description: "Changes prefix for specefic server",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    category: 'utility',
    default_member_permissions: 'Administrator',
    options: [{
        name: 'prefix',
        description: 'The Prefic you want to use.',
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    run: async(client, interaction) => {
        await interaction.deferReply();
        const prefix = interaction.options.getString('prefix');

        try {
            let guildop = await Guild.findOne({ guildId: interaction.guild.id });
            if (!guildop) {
                guildop = new Guild({
                    guildId: interaction.guild.id,
                    prefix: prefix

                });
            } else {
                guildop.prefix = prefix;
            }
            await guildop.save();

            await interaction.editReply(`The prefix is changed to ${prefix}`);
        } catch (error) {
            console.error('Error setting Prefix', error);
            await interaction.editReply("Error: can't change prefix");
        }

    }
}
const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: "Display user's avatar",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [{
        name: 'user',
        description: 'The avatar of the user you want to display.',
        type: ApplicationCommandOptionType.User,
        required: true
    }],
    run: async(client, interaction) => {
        await interaction.deferReply();

        const targetUser = interaction.options.getMember('user');
        const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 2048 });

        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle(`${targetUser.user.tag}'s Avatar`)
            .setImage(avatarURL)
            .setFooter({ text: `Requested by ${interaction.user.tag}` });

        const formats = ['png', 'jpg', 'jpeg', 'gif'];
        const components = formats.map(format => {
            let imageOptions = { extension: format, forceStatic: format !== 'gif' };

            // Check if user has no custom avatar and format is not PNG
            if (!targetUser.avatar && format !== 'png') return null;
            // Skip GIF option if the avatar is not animated
            if (format === 'gif' && !targetUser.displayAvatarURL({ dynamic: true }).endsWith('.gif')) return null;

            return new ButtonBuilder()
                .setLabel(format.toUpperCase())
                .setStyle(5)
                .setURL(targetUser.displayAvatarURL(imageOptions));
        }).filter(button => button !== null);

        const row = new ActionRowBuilder().addComponents(components);

        await interaction.editReply({ embeds: [embed], components: [row] });

        const embed2 = new EmbedBuilder()
            .setColor('#0000FF')
            .setDescription('Click the buttons above to view the avatar in different formats.');

        await interaction.followUp({ embeds: [embed2] });
    },
};

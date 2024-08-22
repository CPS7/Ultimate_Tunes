const { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const User = require('../../models/users');

module.exports = {
    name: 'checkpremium',
    description: "Display user's premium status",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    category: "premium",
    options: [{
        name: 'user',
        description: 'The user to check premium status for',
        type: ApplicationCommandOptionType.User,
        required: false
    }],
    run: async(client, interaction) => {
        const member = interaction.options.getMember('user') || interaction.member;

        try {
            const user = await User.findOne({ userId: member.id });

            if (user && user.isPremium) {
                const premiumSince = user.premiumSince ? user.premiumSince.toLocaleString() : 'N/A';
                const premiumExpiration = user.premiumExpiration ? user.premiumExpiration.toLocaleString() : 'N/A';
                const premiumPlan = user.premiumPlan ? user.premiumPlan.charAt(0).toUpperCase() + user.premiumPlan.slice(1) : 'N/A';

                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setAuthor({name: `${member.user.tag}`})
                    .setTitle("Premium Status")
                    .addFields({name: "**Premium**", value: `\`${user.isPremium}\``}, {name: "**Plan**", value: `\`${premiumPlan}\``}, {name: "**Since**", value: `\`${premiumSince}\``}, {name: "**Expire**", value: `\`${premiumExpiration}\``})
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({name: `${member.user.tag}`})
                    .setTitle("Premium Status")
                    .setDescription(`${member.user.name} is not a premium user`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error checking premium status:', error);
            await interaction.reply("Error checking premium status");
        }
    },
};

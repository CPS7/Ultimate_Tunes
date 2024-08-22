const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const Guild = require('../../models/guilds');
const User = require('../../models/users');

module.exports = {
    name: 'checkpremium',
    description: "The language to set (e.g., en, es).",
    cooldown: 3000,
    usage: '<prefix>premium <user>',
    category: "premium",
    run: async(client, message, args) => {
        let member = message.mentions.members.first();

        if (!member) {
            member = message.member;
        }

        try {
            const user = await User.findOne({ userId: member.id });
            const url = message.author.displayAvatarURL()

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

                await message.reply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({name: `${member.user.tag}`})
                    .setTitle("Premium Status")
                    .setDescription(`${member.user.name} is not a premium user`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await message.reply({embeds: [embed]});
            }
        } catch (error) {
            console.error('Error checking premium status:', error);
            await message.reply(`error checking status`);
        }
    }
}
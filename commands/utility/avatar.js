const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: "Display user's avatar",
    cooldown: 3000,
    usage: '<prefix>avatar [@user]',
    category: 'utility',
    run: async(client, message, args) => {
        const mention = message.mentions.users.first();

        if (!mention) {
            return message.reply("Please mention a user to view their avatar.");
        }

        try {
            const targetUser = await message.guild.members.fetch(mention.id);
            const avatarURL = targetUser.user.displayAvatarURL({ dynamic: true, size: 2048 });

            const embed = new EmbedBuilder()
                .setColor('#7289DA')
                .setTitle(`${targetUser.user.tag}'s Avatar`)
                .setImage(avatarURL)
                .setFooter({ text: `Requested by ${message.author.tag}` });

            const formats = ['png', 'jpg', 'jpeg', 'gif'];
            const components = [];
            formats.forEach(format => {
                let imageOptions = { extension: format, forceStatic: format == 'gif' ? false : true };

                if (targetUser.avatar == null && format !== 'png') return;
                if (format === 'gif') return;
                components.push(
                    new ButtonBuilder()
                    .setLabel(format.toUpperCase())
                    .setStyle(5)
                    .setURL(targetUser.displayAvatarURL(imageOptions))
                );
            });

            const row = new ActionRowBuilder()
                .addComponents(components);

            await message.reply({ embeds: [embed], components: [row] });

            const embed2 = new EmbedBuilder()
                .setColor('#0000FF')
                .setDescription("Click the buttons below to view the avatar in different formats.");

            await message.channel.send({ embeds: [embed2] });
        } catch (error) {
            console.error('Failed to fetch user or send avatar:', error);
            return message.reply("There was an error fetching the user's avatar. Please try again.");
        }
    },
};

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'invite',
    description: "Get the bot's invite link",
    cooldown: 5,
    run: async(client, message, args) => {
        const servers = client.guilds.cache.size;
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setTitle("Invite UltimateTune")
            .setDescription(`UltimateTune is currently in **${servers}** servers! Click the button below to invite the bot to your server.`)
            .setColor('#FFA500')
            .setTimestamp()
            .setThumbnail(client.user.displayAvatarURL());

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel("Invite")
                .setURL(inviteUrl)
                .setStyle(5) // ButtonStyle.Link
            );

        try {
            await message.reply({ embeds: [embed], components: [actionRow] });
        } catch (error) {
            console.error('Failed to send invite:', error);
            return message.reply("There was an error sending the invite link. Please try again later.");
        }
    },
};

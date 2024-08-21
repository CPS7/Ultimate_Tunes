const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: "userinfo",
    description: "Shows information about a user",
    run: async(client, message, args) => {
        // Extract user mentioned or use message author
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

        const joinedAgoCalculator = {
            fetch: {
                user(userInput, type) {
                    if (!userInput) throw new ReferenceError('You didn\'t provide the user to calculate.');

                    if (type === "discord") {
                        return moment(userInput.user.createdAt).fromNow();
                    } else if (type === "server") {
                        return moment(userInput.joinedAt).fromNow();
                    } else {
                        throw new ReferenceError('Invalid type. Use "discord" or "server" only.');
                    }
                }
            }
        };

        const bot = user.user.bot ? "Yes" : "No";

        const acknowledgements = {
            fetch: {
                user(userInput) {
                    let result = "Member";

                    try {
                        if (userInput.permissions.has(PermissionsBitField.Flags.ViewChannel)) result = "Member";
                        if (userInput.permissions.has(PermissionsBitField.Flags.KickMembers)) result = "Moderator";
                        if (userInput.permissions.has(PermissionsBitField.Flags.ManageGuild)) result = "Manager";
                        if (userInput.permissions.has(PermissionsBitField.Flags.Administrator)) result = "Administrator";
                        if (userInput.id === message.guild.ownerId) result = "Owner";
                    } catch (e) {
                        result = "Member";
                    }

                    return result;
                }
            }
        };

        const embed = new EmbedBuilder()
            .setTitle(`User Information: ${user.user.tag}`)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .addFields(
                { name: "Full Name", value: user.user.tag, inline: true },
                { name: "User ID", value: `\`${user.id}\``, inline: true },
                { name: `Roles (${user.roles.cache.size - 1})`, value: user.roles.cache.map(role => role).join(' ').replace('@everyone', '') || "No roles", inline: true },
                { name: "Joined Server", value: `${new Date(user.joinedTimestamp).toLocaleString()}\n(${joinedAgoCalculator.fetch.user(user, "server")})`, inline: true },
                { name: "Joined Discord", value: `${new Date(user.user.createdTimestamp).toLocaleString()}\n(${joinedAgoCalculator.fetch.user(user, "discord")})`, inline: true },
                { name: "Is a Bot", value: bot, inline: true },
                { name: "Acknowledgements", value: acknowledgements.fetch.user(user) }
            )
            .setColor('#0000FF');

        message.reply({ embeds: [embed] });
    },
};

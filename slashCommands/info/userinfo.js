const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: "userinfo",
    description: "Shows the info about a user",
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'user',
        description: 'The user whose info you want to display.',
        type: ApplicationCommandOptionType.User,
        required: true
    }],
    category: 'info',
    run: async(client, interaction) => {
        const user = interaction.options.getMember('user');

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

        const bot = {
            true: 'Yes',
            false: 'No'
        };

        const acknowledgements = {
            fetch: {
                user(userInput) {
                    let result = 'Member';

                    try {
                        if (userInput.permissions.has(PermissionsBitField.Flags.ViewChannel)) result = 'Member';
                        if (userInput.permissions.has(PermissionsBitField.Flags.KickMembers)) result = 'Moderator';
                        if (userInput.permissions.has(PermissionsBitField.Flags.ManageGuild)) result = 'Manager';
                        if (userInput.permissions.has(PermissionsBitField.Flags.Administrator)) result = 'Administrator';
                        if (userInput.id === interaction.guild.ownerId) result = 'Server Owner';

                    } catch (e) {
                        result = 'Member';
                    }

                    return result;
                }
            }
        };

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${user.user.tag}'s Information`)
                .setThumbnail(user.user.displayAvatarURL({ dynamic: true, size: 4096 }))
                .addFields(
                    { name: 'Full Name', value: user.user.tag, inline: true },
                    { name: 'Identification', value: `\`${user.id}\``, inline: true },
                    { name: `Roles (${user.roles.cache.size - 1})`, value: user.roles.cache.map(role => role).join(' ').replace('@everyone', '') || 'No Roles', inline: true },
                    { name: 'Joined Server', value: `${new Date(user.joinedTimestamp).toLocaleString()}\n(${joinedAgoCalculator.fetch.user(user, "server")})`, inline: true },
                    { name: 'Joined Discord', value: `${new Date(user.user.createdTimestamp).toLocaleString()}\n(${joinedAgoCalculator.fetch.user(user, "discord")})`, inline: true },
                    { name: 'Bot', value: bot[user.user.bot], inline: true },
                    { name: 'Acknowledgements', value: acknowledgements.fetch.user(user) }
                )
                .setColor('#0000FF')
            ],
            ephemeral: false
        });
    },
};

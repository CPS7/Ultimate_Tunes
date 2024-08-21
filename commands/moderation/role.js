const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'role',
    description: "Manage roles of the server or members.",
    cooldown: 3000,
    usage: "<prefix>role add @rolename @username>",
    botPerm: ['MANAGE_ROLES'], // Permissions the bot needs
    userPerm: ['MANAGE_ROLES'], // Permissions the user needs
    run: async(client, message, args) => {
        // Check if the bot has the required permissions
        if (!message.guild.members.me.permissions.has(this.botPerm)) {
            return message.reply("I do not have permission to manage roles.");
        }

        // Check if the user has the required permissions
        if (!message.member.permissions.has(this.userPerm)) {
            return message.reply("You do not have permission to manage roles.");
        }

        const subcommand = args[0];
        if (!subcommand) {
            return message.reply("Please specify a subcommand (e.g., `add`).");
        }

        if (subcommand === 'add') {
            const roleArg = message.mentions.roles.first();
            const memberArg = message.mentions.members.first();

            if (!roleArg || !memberArg) {
                return message.reply("Please mention both a role and a user.");
            }

            try {
                if (memberArg.roles.cache.has(roleArg.id)) {
                    return message.reply(`${memberArg.user.tag} already has the role ${roleArg.name}.`);
                }

                await memberArg.roles.add(roleArg.id);

                const embed = new EmbedBuilder()
                    .setTitle("Role Added")
                    .setDescription(`Successfully added the role ${roleArg.name} to ${memberArg.user.tag}.`)
                    .setColor('Green')
                    .setTimestamp()
                    .setThumbnail(memberArg.user.displayAvatarURL())
                    .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() });

                return message.channel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error adding role:', error);
                return message.reply("There was an error adding the role. Please try again.");
            }
        } else {
            return message.reply("Invalid subcommand. Please use `add`.");
        }
    }
};

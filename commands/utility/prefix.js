const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Guild = require("../../models/guilds");

module.exports = {
    name: 'prefix',
    description: "Changes prefix for specific server",
    cooldown: 3000,
    usage: '<prefix>prefix <string>',
    userPerms: [PermissionsBitField.Flags.Administrator],
    run: async(client, message, args) => {
        const prefix = args[0];

        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You need Admin role for that');
        }

        if (!prefix) {
            return message.reply('Please provide a prefix to set.');
        }

        try {
            let guildop = await Guild.findOne({ guildId: message.guild.id });
            if (!guildop) {
                guildop = new Guild({
                    guildId: message.guild.id,
                    prefix: prefix
                });
            } else {
                guildop.prefix = prefix;
            }
            await guildop.save();

            await message.reply(`The prefix is changed to ${prefix}`);
        } catch (error) {
            console.error('Error setting prefix', error);
            await message.reply("Error: can't change prefix");
        }

        // Delete the user's command message
        if (message.deletable) {
            message.delete();
        }
    }
};
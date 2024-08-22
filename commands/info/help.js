const { EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guilds'); // Adjust the import as necessary
const { cooldown } = require('./invite');

module.exports = {
    name: 'help',
    description: 'Displays a list of available commands or details about a specific command',
    category: 'info',
    usage: '<prefix>help [command]',
    cooldown: 3000,
    run: async (client, message, args) => {
        const embed = new EmbedBuilder();
        const guild = await Guild.findOne({ guildId: message.guild.id });
        const commands = client.commands.filter(cmd => cmd.category !== 'owner');
        const categories = [...new Set(commands.map(cmd => cmd.category))];

        if (args[0]) {
            const command = client.commands.get(args[0].toLowerCase());
            if (!command) {
                return await message.reply({
                    embeds: [
                        embed
                            .setColor('RED') // Adjust to your color scheme
                            .setDescription(`Command \`${args[0]}\` not found.`),
                    ],
                });
            }

            const helpEmbed = embed
                .setColor("Blue")
                .setTitle(`Help - ${command.name}`)
                .setDescription(`
**Description:** ${command.description || 'No description provided.'}
**Usage:** \`${guild.prefix}${command.usage || 'No usage provided.'}\`
**Aliases:** ${command.aliases ? command.aliases.map(alias => `\`${alias}\``).join(', ') : 'No aliases.'}
**Category:** ${command.category}
**Cooldown:** ${command.cooldown || 'No cooldown.'}
**Permissions (User):** ${Array.isArray(command.userPerm) && command.userPerm.length > 0 ? command.userPerm.map(perm => `\`${perm}\``).join(', ') : 'None'}
**Permissions (Bot):** ${Array.isArray(command.botPerm) && command.botPerm.length > 0 ? command.botPerm.map(perm => `\`${perm}\``).join(', ') : 'None'}
**Owner Only:** ${command.ownerOnly ? 'Yes' : 'No'}
**Admin Only:** ${command.adminOnly ? 'Yes' : 'No'}
**Player Required:** ${command.playing ? 'Yes' : 'No'}
**Voice Channel Required:** ${command.player ? 'Yes' : 'No'}
**Same Voice Channel Connected Required:** ${command.sameVoiceChannel ? 'Yes' : 'No'}
                `);

            return await message.reply({ embeds: [helpEmbed] });
        }

        // Create a string for the description
        const commandList = categories.map(category => {
            const cmds = commands
                .filter(cmd => cmd.category === category)
                .map(cmd => `\`${cmd.name}\``)
                .join(', ');
            return `**${category}**:\n${cmds}`;
        }).join('\n\n');

        const helpEmbed = embed
            .setColor("Blue")
            .setTitle('Help')
            .setDescription(`
**Bot Name:** ${client.user.username}
**Prefix:** \`${guild.prefix}\`

${commandList}
                `)
            .setFooter({
                text: `Use ${guild.prefix}help [command] to get details on a specific command.`,
            });

        return await message.reply({ embeds: [helpEmbed] });
    }
};

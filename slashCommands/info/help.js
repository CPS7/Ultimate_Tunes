const { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const Guild = require('../../models/guilds'); // Adjust the path as needed

module.exports = {
    name: 'help',
    description: "Displays a list of available commands or details about a specific command",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [{
        name: 'command',
        description: 'The Command whose info you want to display.',
        type: ApplicationCommandOptionType.String,
        required: false
    }],
    category: 'info',
    run: async (client, interaction) => {
        const embed = new EmbedBuilder();
        const guild = await Guild.findOne({ guildId: interaction.guild.id }); // Fetch guild settings from the database
        const commands = interaction.client.commands.filter(cmd => cmd.category !== 'owner');
        const categories = [...new Set(commands.map(cmd => cmd.category))];
        const commandName = interaction.options.getString('command');

        if (commandName) {
            const command = interaction.client.commands.get(commandName.toLowerCase());
            if (!command) {
                return await interaction.reply({
                    embeds: [
                        embed
                            .setColor('RED')
                            .setDescription(`Command \`${commandName}\` not found.`),
                    ],
                    ephemeral: true
                });
            }

            const helpEmbed = embed
                .setColor("Blue")
                .setTitle(`Help - ${command.name}`)
                .setDescription(`
**Description:** ${command.description || 'No description provided.'}
**Category:** ${command.category}
**Cooldown:** ${command.cooldown || 'No cooldown.'}
**Permissions (User):** ${Array.isArray(command.userPerm) && command.userPerm.length > 0 ? command.userPerm.map(perm => `\`${perm}\``).join(', ') : 'None'}
**Permissions (Bot):** ${Array.isArray(command.botPerm) && command.botPerm.length > 0 ? command.botPerm.map(perm => `\`${perm}\``).join(', ') : 'None'}
**Owner Only:** ${command.ownerOnly ? 'Yes' : 'No'}
**Admin Only:** ${command.adminOnly ? 'Yes' : 'No'}
**Player Required:** ${command.playing ? 'Yes' : 'No'}
**Voice Channel Required:** ${command.player ? 'Yes' : 'No'}
**Same Voice Channel Required:** ${command.sameVoiceChannel ? 'Yes' : 'No'}
                `);

            return await interaction.reply({ embeds: [helpEmbed] });
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
**Bot Name:** ${interaction.client.user.username}
**Prefix:** \`${guild.prefix}\`

${commandList}
            `)
            .setFooter({
                text: `Use \`${guild.prefix}help [command]\` to get details on a specific command.`,
            });

        return await interaction.reply({ embeds: [helpEmbed] });
    }
};

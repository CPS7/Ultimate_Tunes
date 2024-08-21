const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'role',
    description: "Manage roles of the server or members.",
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'ManageRoles',
    options: [{
        name: 'add',
        description: 'Add role to a user.',
        type: 1,
        options: [{
                name: 'role',
                description: 'The role you want to add to the user.',
                type: ApplicationCommandOptionType.Role,
                required: true
            },
            {
                name: 'user',
                description: 'The user you want to add the role to.',
                type: ApplicationCommandOptionType.User,
                required: true
            }
        ]
    }],
    run: async(client, interaction) => {
        if (interaction.options.getSubcommand() === 'add') {
            try {
                const member = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
                const role = interaction.options.getRole('role');

                if (member.roles.cache.has(role.id)) {
                    return interaction.reply({ content: `${member.user.tag} already has the ${role.name} role.`, ephemeral: true });
                }

                await member.roles.add(role.id);

                const embed = new EmbedBuilder()
                    .setTitle('Role Added')
                    .setDescription(`Successfully added the ${role.name} role to ${member.user.tag}.`)
                    .setColor('Green')
                    .setTimestamp()
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

                return interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error adding role:', error);
                return interaction.reply({ content: 'There was an error while adding the role.', ephemeral: true });
            }
        } else {
            return interaction.reply({ content: 'Invalid subcommand.', ephemeral: true });
        }
    }
};

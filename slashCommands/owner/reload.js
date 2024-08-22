const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType } = require('discord.js');
const path = require('path');
const fs = require('fs');
const owner = ["727154675496779826", "1263127637832892506"]
const strings = { str1: 'Hello', str2: 'World' };
const foldersPath = path.join(__dirname, '..'); // Path to the main commands folder

module.exports = {
    name: 'reload',
    description: "reloads a specefic command",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    ownerOnly:true,
    adminOnly:true,
    category: "owner",
    options: [{
        name: 'commands',
        description: 'The command you want to reload.',
        type: ApplicationCommandOptionType.String,
        required: true,
    }],

    run: async(client, interaction) => {
        await interaction.deferReply();

        if (!owner.includes(interaction.user.id)) {
            await interaction.editReply('You are not authorized to use this command.');
            return
        }
        const commandName = interaction.options.getString('commands', true);
        let commandFound = false;

        console.log(`Scanning for commands in ${foldersPath}`); // Debugging output

        const findCommandFile = (dir) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    const result = findCommandFile(filePath); // Recurse into subdirectories
                    if (result) return result; // Return the path if found in subdirectory
                } else if (file.startsWith(commandName)) {
                    console.log(`Found command file: ${filePath}`); // Debugging output
                    return filePath; // Return the path to the command file
                }
            }
            return null;
        };

        const commandPath = findCommandFile(foldersPath);

        if (commandPath) {
            delete require.cache[require.resolve(commandPath)];

            try {
                const newCommand = require(commandPath);
                interaction.client.commands.set(newCommand.name, newCommand);
                await interaction.editReply(`Command \`${newCommand.name}\` was reloaded!`);
                await new Promise(r => setTimeout(r, 5000));
                await interaction.deleteReply();
                commandFound = true;
            } catch (error) {
                console.error(`Error loading command at ${commandPath}:`, error);
                await interaction.editReply(`There was an error while reloading the command \`${commandName}\`:\n\`${error.message}\``);
                await new Promise(r => setTimeout(r, 5000));
                await interaction.deleteReply();
            }
        }

        if (!commandFound) {
            await interaction.editReply(`Command \`${commandName}\` not found.`);
            await new Promise(r => setTimeout(r, 5000));
            await interaction.deleteReply();
        }
    }
}
const { EmbedBuilder, PermissionsBitField, Collection } = require('discord.js');
const client = require('..');
const ms = require('ms'); // Ensure you have the ms module for time formatting

const cooldown = new Collection();
const globalCooldown = 10 * 1000; // 10 seconds global cooldown

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;

    if (cooldown.has(userId)) {
        const remainingTime = cooldown.get(userId) - Date.now();
        if (remainingTime > 0) {
            return interaction.reply({
                content: `🚫 You are on cooldown! Please wait ${ms(remainingTime, { long: true })} before interacting with any button again.`,
                ephemeral: true
            });
        }
    }

    cooldown.set(userId, Date.now() + globalCooldown); // Set the global cooldown
    setTimeout(() => cooldown.delete(userId), globalCooldown); // Clear the cooldown after it expires

    const button = client.buttons.get(interaction.customId);
    if (!button) return;

    try {
        if(button.permissions) {
            if(!interaction.memberPermissions.has(PermissionsBitField.resolve(button.permissions || []))) {
                const perms = new EmbedBuilder()
                    .setDescription(`🚫 ${interaction.user}, You don't have \`${button.permissions}\` permissions to interact with this button!`)
                    .setColor('Red');
                return interaction.reply({ embeds: [perms], ephemeral: true });
            }
        }
        await button.run(client, interaction);
    } catch (error) {
        console.log(error);
    }
});

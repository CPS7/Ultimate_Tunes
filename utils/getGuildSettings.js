
const Guild = require('../models/guilds'); // Adjust the path as needed

async function getGuildSettings(guildId) {
    try {
        const guildSettings = await Guild.findOne({ guildId });
        if (!guildSettings) {
            guildop = new Guild({
                guildId: guildId,
            });
        }
        return guildSettings;
    } catch (error) {
        console.error('Error getting guild settings:', error);
        throw error;
    }
}

module.exports = {
    getGuildSettings
};
